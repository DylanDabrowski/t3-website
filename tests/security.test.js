const assert = require("node:assert/strict");
const { generateKeyPairSync, sign } = require("node:crypto");
const Module = require("node:module");
const path = require("node:path");
const test = require("node:test");

require("ts-node").register({
  transpileOnly: true,
  compilerOptions: { module: "CommonJS" },
});

// Exercise real Clerk signature verification and real tRPC routers. Only external
// services and configuration are replaced; no database, S3 or Clerk network calls.
const { verifyToken } = require("@clerk/backend");
const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
});
const env = { NEXT_PUBLIC_ADMINID: "user_admin", BUCKET_NAME: "test-bucket" };
let effects = [];
const record = (name, result) => async () => {
  effects.push(name);
  return result;
};
const prisma = {
  post: {
    create: record("post.create", { id: "post_1" }),
    findMany: record("post.findMany", []),
    findUnique: record("post.findUnique", { id: "post_1" }),
  },
};
const s3 = {
  listObjectsV2: record("s3.list", { Contents: [] }),
  getObject: record("s3.get", { Body: "test" }),
  createMultipartUpload: record("s3.createMultipart", { UploadId: "upload_1" }),
  completeMultipartUpload: record("s3.completeMultipart", { Key: "test" }),
};
const root = path.resolve(__dirname, "..");
const originalLoad = Module._load;
Module._load = function (specifier, parent, isMain) {
  if (specifier === "@clerk/backend") {
    return {
      verifyToken: (token, options) => {
        assert.equal(options.secretKey, "test-only-placeholder");
        assert.equal(options.issuer, null);
        return verifyToken(token, { jwtKey: publicKey });
      },
    };
  }
  if (specifier === "@aws-sdk/s3-request-presigner") {
    return {
      getSignedUrl: record("s3.sign", "https://example.invalid/upload"),
    };
  }
  if (specifier === "@upstash/redis") return { Redis: { fromEnv: () => ({}) } };
  if (specifier === "@upstash/ratelimit") {
    return {
      Ratelimit: class {
        static slidingWindow() {}
      },
    };
  }
  const resolved = specifier.startsWith("~/")
    ? path.join(root, "src", specifier.slice(2))
    : specifier;
  if (resolved === path.join(root, "src/env.mjs")) return { env };
  if (resolved === path.join(root, "src/server/db")) return { prisma };
  if (specifier === "../aws/s3") return { s3 };
  return originalLoad.call(this, resolved, parent, isMain);
};
let appRouter, createTRPCContext, getRequestUserId;
try {
  ({ appRouter } = require("../src/server/api/root.ts"));
  ({ createTRPCContext } = require("../src/server/api/trpc.ts"));
  ({ getRequestUserId } = require("../src/server/auth.ts"));
} finally {
  Module._load = originalLoad;
}

function sessionToken(
  userId,
  expiration = Math.floor(Date.now() / 1000) + 300
) {
  const header = Buffer.from(
    JSON.stringify({ alg: "RS256", typ: "JWT" })
  ).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({ sub: userId, sid: "sess_test", exp: expiration })
  ).toString("base64url");
  const message = `${header}.${payload}`;
  return `${message}.${sign(
    "sha256",
    Buffer.from(message),
    privateKey
  ).toString("base64url")}`;
}
const request = (cookies = {}, headers = {}) => ({ cookies, headers });
const postInput = {
  image: "",
  title: "Test",
  description: "Test",
  content: [],
};
const protectedCalls = [
  ["create post", (caller) => caller.posts.create(postInput)],
  ["list S3 objects", (caller) => caller.s3.getObjects()],
  ["read S3 object", (caller) => caller.s3.getObjectByKey({ key: "test" })],
  [
    "sign upload",
    (caller) => caller.s3.getStandardUploadPresignedUrl({ key: "test" }),
  ],
  [
    "start multipart upload",
    (caller) =>
      caller.s3.getMultipartUploadPresignedUrl({
        key: "test",
        filePartTotal: 1,
      }),
  ],
  [
    "complete multipart upload",
    (caller) =>
      caller.s3.completeMultipartUpload({
        key: "test",
        uploadId: "upload_1",
        parts: [{ ETag: "test", PartNumber: 1 }],
      }),
  ],
];

for (const [label, userId, code] of [
  ["anonymous", null, "UNAUTHORIZED"],
  ["non-admin", "user_other", "FORBIDDEN"],
]) {
  for (const [operation, run] of protectedCalls) {
    test(`${label} cannot ${operation}`, async () => {
      effects = [];
      const caller = appRouter.createCaller({ prisma, s3, userId });
      await assert.rejects(run(caller), (error) => error.code === code);
      assert.deepEqual(effects, []);
    });
  }
}

test("verified admin can use all protected operations", async () => {
  process.env.CLERK_SECRET_KEY = "test-only-placeholder";
  const ctx = await createTRPCContext({
    req: request({ __session: sessionToken("user_admin") }),
  });
  assert.equal(ctx.userId, "user_admin");
  effects = [];
  const caller = appRouter.createCaller(ctx);
  for (const [, run] of protectedCalls) await run(caller);
  assert.deepEqual(effects, [
    "post.create",
    "s3.list",
    "s3.get",
    "s3.sign",
    "s3.createMultipart",
    "s3.sign",
    "s3.completeMultipart",
  ]);
});

test("public post reads still work without a session", async () => {
  const caller = appRouter.createCaller({ prisma, s3, userId: null });
  assert.deepEqual(await caller.posts.getAll(), []);
  assert.deepEqual(await caller.posts.getById({ id: "post_1" }), {
    id: "post_1",
  });
});

test("missing admin configuration fails closed", async () => {
  const adminId = env.NEXT_PUBLIC_ADMINID;
  env.NEXT_PUBLIC_ADMINID = "";
  try {
    const caller = appRouter.createCaller({ prisma, s3, userId: "user_admin" });
    await assert.rejects(
      caller.posts.create(postInput),
      (error) => error.code === "FORBIDDEN"
    );
  } finally {
    env.NEXT_PUBLIC_ADMINID = adminId;
  }
});

test("API verifies bearer sessions and rejects expired or forged sessions", async () => {
  process.env.CLERK_SECRET_KEY = "test-only-placeholder";
  assert.equal(
    await getRequestUserId(
      request({}, { authorization: `Bearer ${sessionToken("user_admin")}` })
    ),
    "user_admin"
  );
  assert.equal(
    await getRequestUserId(
      request({ __session: sessionToken("user_admin", 1) })
    ),
    null
  );
  const valid = sessionToken("user_other");
  const forgedPayload = Buffer.from(
    JSON.stringify({ sub: "user_admin", exp: 9999999999 })
  ).toString("base64url");
  const forged = `${valid.split(".")[0]}.${forgedPayload}.${
    valid.split(".")[2]
  }`;
  const ctx = await createTRPCContext({
    req: request(
      { __session: forged },
      {
        "x-clerk-auth-status": "signed-in",
        "x-middleware-subrequest": "middleware",
      }
    ),
  });
  assert.equal(ctx.userId, null);
  await assert.rejects(
    appRouter.createCaller(ctx).posts.create(postInput),
    (error) => error.code === "UNAUTHORIZED"
  );
  assert.equal(
    await getRequestUserId(
      request(
        {},
        { "x-clerk-auth-status": "signed-in", "x-user-id": "user_admin" }
      )
    ),
    null
  );
});

test("missing Clerk key fails closed", async () => {
  delete process.env.CLERK_SECRET_KEY;
  assert.equal(
    await getRequestUserId(request({ __session: sessionToken("user_admin") })),
    null
  );
});

test("source-map-js rejects malicious indexed section offsets", () => {
  const { SourceMapConsumer } = require("source-map-js");
  assert.equal(
    require("source-map-js/package.json").version,
    require("../package-lock.json").packages["node_modules/source-map-js"].version
  );
  assert.throws(
    () =>
      new SourceMapConsumer({
        version: 3,
        sections: [
          {
            offset: { line: 100000000, column: 0 },
            map: { version: 3, sources: [], names: [], mappings: "" },
          },
        ],
      }),
    /offset/i
  );
});
