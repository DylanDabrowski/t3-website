#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const ROOT = process.cwd();
const PREVIEW_DIR = path.join(ROOT, ".exhibit-preview");
const PREVIEW_PORT = 4173;
const PREVIEW_URL = `http://127.0.0.1:${PREVIEW_PORT}`;
const PREVIEW_UPLOAD_URL = process.env.PREVIEW_UPLOAD_URL;
const PREVIEW_UPLOAD_TOKEN = process.env.PREVIEW_UPLOAD_TOKEN;
const REPO_FULL_NAME = process.env.GITHUB_REPOSITORY;
const COMMIT_SHA = process.env.GITHUB_SHA;
const UPLOAD_BATCH_SIZE = Number(process.env.PREVIEW_UPLOAD_BATCH_SIZE || "25");
const PREVIEW_INTERACTIVE = process.env.PREVIEW_INTERACTIVE !== "0";
const SCRIPT_VERSION = "preview-script-v30";

if (!PREVIEW_UPLOAD_URL || !PREVIEW_UPLOAD_TOKEN) {
  console.error("Missing PREVIEW_UPLOAD_URL or PREVIEW_UPLOAD_TOKEN");
  process.exit(1);
}

console.log(`Exhibit preview script: ${SCRIPT_VERSION}`);
function describeUploadUrl(value) {
  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname}`;
  } catch {
    return value;
  }
}
console.log(`Preview upload URL: ${describeUploadUrl(PREVIEW_UPLOAD_URL)}`);
if (REPO_FULL_NAME) {
  console.log(`Repository: ${REPO_FULL_NAME}`);
}
if (COMMIT_SHA) {
  console.log(`Commit: ${COMMIT_SHA}`);
}
console.log(`Upload batch size: ${UPLOAD_BATCH_SIZE}`);
console.log(`Interactive previews: ${PREVIEW_INTERACTIVE ? "enabled" : "disabled"}`);

const exts = [".tsx", ".jsx"];
const ignoredDirs = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "out",
  ".exhibit-preview",
]);
const aliasCandidates = [
  { find: "next/link", file: "stubs/next-link.tsx" },
  { find: "next/image", file: "stubs/next-image.tsx" },
  { find: "next/navigation", file: "stubs/next-navigation.ts" },
  { find: "next/router", file: "stubs/next-router.ts" },
  { find: "next/head", file: "stubs/next-head.tsx" },
  { find: ".prisma/client/index-browser", file: "stubs/prisma-client.ts" },
  { find: "@prisma/client", file: "stubs/prisma-client.ts" },
  { find: "@t3-oss/env-nextjs", file: "stubs/env.ts" },
  { find: "@t3-oss/env-core", file: "stubs/env.ts" },
  { find: "@clerk/nextjs", file: "stubs/clerk.tsx" },
  { find: "@clerk/clerk-react", file: "stubs/clerk.tsx" },
  { find: "@trpc/react-query", file: "stubs/trpc-react.ts" },
  { find: "@trpc/react-query/ssg", file: "stubs/trpc-react-ssg.ts" },
  { find: "@trpc/next", file: "stubs/trpc-next.ts" },
  { find: "@trpc/client", file: "stubs/trpc-client.ts" },
  { find: "@trpc/server", file: "stubs/trpc-server.ts" },
  { find: "~/utils/api", file: "stubs/api.ts" },
  { find: "@/utils/api", file: "stubs/api.ts" },
  { find: "env.mjs", file: "stubs/env.ts" },
];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    if (entry.isDirectory() && ignoredDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

function findComponents() {
  const files = walk(ROOT);
  return files.filter((f) => exts.includes(path.extname(f).toLowerCase()));
}

function getTailwindConfigPath() {
  const candidates = [
    "tailwind.config.js",
    "tailwind.config.cjs",
    "tailwind.config.mjs",
    "tailwind.config.ts",
  ];
  for (const rel of candidates) {
    const full = path.join(ROOT, rel);
    if (fs.existsSync(full)) {
      return full;
    }
  }
  return null;
}

function ensureTailwindConfigForPostcss(configPath) {
  if (!configPath) return null;
  const ext = path.extname(configPath).toLowerCase();
  if (ext === ".js" || ext === ".cjs") return configPath;
  const outputPath = path.join(PREVIEW_DIR, "tailwind.config.cjs");
  try {
    const esbuild = require("esbuild");
    esbuild.buildSync({
      entryPoints: [configPath],
      outfile: outputPath,
      bundle: true,
      platform: "node",
      format: "cjs",
      target: "node18",
      logLevel: "silent",
    });
    return outputPath;
  } catch {
    console.warn(
      "Failed to transpile Tailwind config for previews, using defaults.",
    );
    return null;
  }
}

function toPosixPath(value) {
  return value.replace(/\\/g, "/");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripJsonComments(content) {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

function stripJsonTrailingCommas(content) {
  return content.replace(/,\s*([}\]])/g, "$1");
}

function extractAliasFromRaw(raw, configPath) {
  const baseUrlMatch = raw.match(/"baseUrl"\s*:\s*"([^"]+)"/);
  const baseUrl = baseUrlMatch ? baseUrlMatch[1] : "";
  const baseDir = configPath ? path.dirname(configPath) : ROOT;
  const aliasRegex = /"([^"]+\/\*)"\s*:\s*\[\s*"([^"]+)"\s*\]/g;
  const aliases = [];
  let match = aliasRegex.exec(raw);
  while (match) {
    const key = match[1];
    const target = match[2];
    if (key.endsWith("/*")) {
      const find = key.replace(/\/\*$/, "");
      const replacement = path.resolve(
        baseDir,
        baseUrl,
        target.replace(/\/\*$/, ""),
      );
      const regexSource = `^${escapeRegExp(find)}/`;
      aliases.push({ find, replacement, regexSource, needsTrailingSlash: true });
    }
    match = aliasRegex.exec(raw);
  }
  return aliases;
}

function resolveConfigExtends(basePath, extendValue) {
  if (!extendValue) return null;
  if (extendValue.startsWith(".") || extendValue.startsWith("/")) {
    const candidate = path.resolve(path.dirname(basePath), extendValue);
    if (fs.existsSync(candidate)) return candidate;
    if (fs.existsSync(`${candidate}.json`)) return `${candidate}.json`;
    return null;
  }
  try {
    return require.resolve(extendValue, { paths: [path.dirname(basePath)] });
  } catch {
    return null;
  }
}

function loadTsConfig(configPath, visited = new Set()) {
  if (!configPath || visited.has(configPath)) return null;
  visited.add(configPath);
  try {
    const raw = fs.readFileSync(configPath, "utf8");
    const cleaned = stripJsonTrailingCommas(stripJsonComments(raw));
    const parsed = JSON.parse(cleaned);
    const extendPath = resolveConfigExtends(configPath, parsed.extends);
    const base = extendPath ? loadTsConfig(extendPath, visited) : null;
    const baseCompiler = base?.compilerOptions || {};
    const parsedCompiler = parsed.compilerOptions || {};
    const mergedCompiler = {
      ...baseCompiler,
      ...parsedCompiler,
      paths: {
        ...(baseCompiler.paths || {}),
        ...(parsedCompiler.paths || {}),
      },
    };
    return {
      ...base,
      ...parsed,
      compilerOptions: mergedCompiler,
    };
  } catch {
    return null;
  }
}

function getProjectAliases() {
  const candidates = ["tsconfig.json", "jsconfig.json"];
  const aliases = [];
  let config = null;
  let configPath = null;
  let rawContent = null;

  for (const filename of candidates) {
    const full = path.join(ROOT, filename);
    if (!fs.existsSync(full)) continue;
    try {
      rawContent = fs.readFileSync(full, "utf8");
    } catch {
      rawContent = null;
    }
    config = loadTsConfig(full);
    configPath = full;
    if (config) break;
  }

  const compilerOptions = config?.compilerOptions || {};
  const baseUrl = compilerOptions.baseUrl
    ? path.resolve(path.dirname(configPath || ROOT), compilerOptions.baseUrl)
    : ROOT;
  const paths = compilerOptions.paths || {};

  for (const [key, targets] of Object.entries(paths)) {
    if (!Array.isArray(targets) || targets.length === 0) continue;
    const hasWildcard = key.endsWith("/*");
    const find = key.replace(/\/\*$/, "");
    const target = String(targets[0]).replace(/\/\*$/, "");
    const replacement = path.resolve(baseUrl, target);
    const regexSource = hasWildcard
      ? `^${escapeRegExp(find)}/`
      : null;
    aliases.push({ find, replacement, regexSource, needsTrailingSlash: hasWildcard });
  }

  if (aliases.length === 0 && rawContent && configPath) {
    aliases.push(...extractAliasFromRaw(rawContent, configPath));
  }

  return aliases;
}

function normalizeAliasEntries(entries) {
  const seen = new Set();
  const unique = [];
  for (const entry of entries) {
    if (!entry?.find || !entry?.replacement) continue;
    const key = `${entry.find}:${entry.regexSource || ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push({
      find: entry.find,
      replacement: toPosixPath(entry.replacement),
      regexSource: entry.regexSource || null,
      needsTrailingSlash: Boolean(entry.needsTrailingSlash),
    });
  }
  return unique;
}

function writeTailwindPreviewConfig(configPath) {
  const transpiled = ensureTailwindConfigForPostcss(configPath);
  const previewConfigPath = path.join(PREVIEW_DIR, "tailwind.preview.cjs");
  const defaultContent = [
    path.join(ROOT, "src/**/*.{js,ts,jsx,tsx,mdx}"),
    path.join(ROOT, "app/**/*.{js,ts,jsx,tsx,mdx}"),
    path.join(ROOT, "pages/**/*.{js,ts,jsx,tsx,mdx}"),
    path.join(ROOT, "components/**/*.{js,ts,jsx,tsx,mdx}"),
  ].map(toPosixPath);
  const configSource = `let userConfig = {};
${
  transpiled
    ? `try {
  const loaded = require(${JSON.stringify(toPosixPath(transpiled))});
  userConfig = loaded && (loaded.default || loaded);
} catch {}
`
    : ""
}
const defaultContent = ${JSON.stringify(defaultContent, null, 2)};
const content = userConfig?.content || userConfig?.purge || defaultContent;
module.exports = { ...userConfig, content };
`;
  fs.writeFileSync(previewConfigPath, configSource);
  return previewConfigPath;
}

function getTailwindMajorVersion() {
  try {
    const pkgPath = path.join(ROOT, "package.json");
    const content = fs.readFileSync(pkgPath, "utf8");
    const pkg = JSON.parse(content);
    const version =
      pkg?.dependencies?.tailwindcss || pkg?.devDependencies?.tailwindcss;
    if (typeof version === "string") {
      const match = version.match(/\d+/);
      if (match) return Number.parseInt(match[0], 10);
    }
  } catch {
    // ignore and fallback
  }
  return null;
}

function extractCssImports(cssContent) {
  const importRegex =
    /@import\s+(?:url\(\s*)?(?:(['"])([^'"]+)\1|([^'")\s]+))(\s*\)?.*)?;/gi;
  const imports = [];
  let match = importRegex.exec(cssContent);
  while (match) {
    const rawPath = match[2] || match[3] || "";
    if (rawPath) imports.push(rawPath);
    match = importRegex.exec(cssContent);
  }
  return imports;
}

function cssUsesTailwind(cssPath, visited) {
  if (!cssPath) return false;
  if (visited.has(cssPath)) return false;
  visited.add(cssPath);
  try {
    const content = fs.readFileSync(cssPath, "utf8");
    if (content.includes("@tailwind") || content.includes("tailwindcss")) {
      return true;
    }
    const imports = extractCssImports(content);
    for (const rawPath of imports) {
      if (
        rawPath.startsWith("http://") ||
        rawPath.startsWith("https://") ||
        rawPath.startsWith("//") ||
        rawPath.startsWith("data:") ||
        rawPath.startsWith("/")
      ) {
        continue;
      }
      const absPath = path.resolve(path.dirname(cssPath), rawPath);
      if (fs.existsSync(absPath) && cssUsesTailwind(absPath, visited)) {
        return true;
      }
    }
  } catch {
    return false;
  }
  return false;
}

function globalCssHasTailwind(cssPath) {
  if (!cssPath) return false;
  return cssUsesTailwind(cssPath, new Set());
}

function findGlobalCss() {
  const candidates = [
    "src/app/globals.css",
    "app/globals.css",
    "src/styles/globals.css",
    "src/styles/index.css",
    "src/index.css",
    "styles/globals.css",
  ];

  const existing = [];
  for (const rel of candidates) {
    const full = path.join(ROOT, rel);
    if (fs.existsSync(full)) {
      existing.push(full);
    }
  }

  if (existing.length === 0) return null;

  const withTailwind = existing.find((filePath) =>
    globalCssHasTailwind(filePath),
  );
  return withTailwind || existing[0];
}

function toFsImportPath(absPath) {
  return `/@fs/${absPath.replace(/\\/g, "/")}`;
}

function parseImportRule(rule) {
  const match =
    /@import\s+(?:url\(\s*)?(?:(['"])([^'"]+)\1|([^'")\s]+))(\s*\)?.*)?;/i.exec(
      rule,
    );
  if (!match) return null;
  return {
    rawPath: match[2] || match[3] || "",
    trailing: match[4] || "",
  };
}

function extractCharset(cssContent) {
  const match = cssContent.match(/^\s*@charset\s+[^;]+;\s*/i);
  if (!match) return { charset: "", rest: cssContent };
  return { charset: match[0].trim(), rest: cssContent.slice(match[0].length) };
}

function rewriteTailwindSources(cssContent, baseDir) {
  return cssContent.replace(/@source\s+([^;]+);/gi, (match, raw) => {
    const cleaned = raw.trim().replace(/^['"]|['"]$/g, "");
    if (
      !cleaned ||
      cleaned.startsWith("http://") ||
      cleaned.startsWith("https://") ||
      cleaned.startsWith("//") ||
      cleaned.startsWith("data:") ||
      cleaned.startsWith("/")
    ) {
      return match;
    }
    const resolved = path.resolve(baseDir, cleaned).replace(/\\/g, "/");
    return '@source "' + resolved + '";';
  });
}

function normalizeTailwindSyntax(cssContent, tailwindMajor, baseDir) {
  if (tailwindMajor !== 4) {
    const importRegex =
      /@import\s+(?:url\(\s*)?(?:(['"])tailwindcss\1|tailwindcss)(?:\s+[^;]+)?;/gi;
    const replaced = cssContent.replace(
      importRegex,
      "@tailwind base;\n@tailwind components;\n@tailwind utilities;",
    );
    return replaced.replace(/^\s*@source\s+[^;]+;\s*/gim, "");
  }
  return rewriteTailwindSources(cssContent, baseDir);
}

function extractImportsAndBody(cssContent) {
  const { charset, rest } = extractCharset(cssContent);
  const imports = [];
  const bodyParts = [];
  let i = 0;

  while (i < rest.length) {
    const next = rest.indexOf("@import", i);
    if (next === -1) {
      bodyParts.push(rest.slice(i));
      break;
    }

    bodyParts.push(rest.slice(i, next));
    let j = next + "@import".length;
    let inSingle = false;
    let inDouble = false;
    let parenDepth = 0;

    while (j < rest.length) {
      const ch = rest[j];
      if (ch === "'" && !inDouble) {
        inSingle = !inSingle;
      } else if (ch === '"' && !inSingle) {
        inDouble = !inDouble;
      } else if (!inSingle && !inDouble) {
        if (ch === "(") parenDepth += 1;
        if (ch === ")" && parenDepth > 0) parenDepth -= 1;
        if (ch === ";" && parenDepth === 0) {
          j += 1;
          break;
        }
      }
      j += 1;
    }

    const rule = rest.slice(next, j).trim();
    if (rule.startsWith("@import")) {
      imports.push(rule);
    } else {
      bodyParts.push(rule);
    }
    i = j;
  }

  const body = bodyParts.join("").trimStart();
  return { charset, imports, body };
}

function normalizeCssForVite(cssContent, baseDir, cache, tailwindMajor) {
  const normalizedCss = normalizeTailwindSyntax(
    cssContent,
    tailwindMajor,
    baseDir,
  );
  const { charset, imports, body } = extractImportsAndBody(normalizedCss);
  const mergedImports = [];
  const bodyParts = [];

  for (const rule of imports) {
    const parsed = parseImportRule(rule);
    if (!parsed) {
      mergedImports.push(rule);
      continue;
    }

    const rawPath = parsed.rawPath;
    if (
      !rawPath ||
      rawPath.startsWith("http://") ||
      rawPath.startsWith("https://") ||
      rawPath.startsWith("//") ||
      rawPath.startsWith("data:") ||
      rawPath.startsWith("/")
    ) {
      mergedImports.push(rule);
      continue;
    }

    const absPath = path.resolve(baseDir, rawPath);
    if (!fs.existsSync(absPath)) {
      mergedImports.push(rule);
      continue;
    }

    if (!cache.has(absPath)) {
      const content = fs.readFileSync(absPath, "utf8");
      cache.set(
        absPath,
        normalizeCssForVite(content, path.dirname(absPath), cache, tailwindMajor),
      );
    }

    const normalized = cache.get(absPath);
    const child = extractImportsAndBody(normalized);
    if (child.imports.length > 0) {
      mergedImports.push(...child.imports);
    }
    if (child.body) {
      bodyParts.push(child.body);
    }
  }

  if (body) {
    bodyParts.push(body);
  }

  const parts = [];
  if (charset) parts.push(charset);
  if (mergedImports.length > 0) {
    const uniqueImports = Array.from(new Set(mergedImports));
    parts.push(uniqueImports.join("\n"));
  }
  if (bodyParts.length > 0) {
    parts.push(bodyParts.join("\n\n"));
  }

  return `${parts.join("\n\n")}\n`;
}

function writeNormalizedGlobalCss(globalCssPath) {
  if (!globalCssPath) return null;
  const targetPath = path.join(PREVIEW_DIR, "src", "preview-global.css");
  try {
    const content = fs.readFileSync(globalCssPath, "utf8");
    const cache = new Map();
    const tailwindMajor = getTailwindMajorVersion();
    const normalized = normalizeCssForVite(
      content,
      path.dirname(globalCssPath),
      cache,
      tailwindMajor,
    );
    fs.writeFileSync(targetPath, normalized);
    return "./preview-global.css";
  } catch {
    return null;
  }
}

function writePreviewStubs(stubDir) {
  fs.mkdirSync(stubDir, { recursive: true });

  fs.writeFileSync(
    path.join(stubDir, "next-link.tsx"),
    `import React from "react";
export default function Link({ href, children, ...props }: any) {
  return (
    <a href={typeof href === "string" ? href : "#"} {...props}>
      {children}
    </a>
  );
}
`,
  );

  fs.writeFileSync(
    path.join(stubDir, "next-image.tsx"),
    `import React from "react";
export default function Image({ alt = "", ...props }: any) {
  return <img alt={alt} {...props} />;
}
`,
  );

  fs.writeFileSync(
    path.join(stubDir, "next-navigation.ts"),
    `export function useRouter() {
  return {
    push: () => {},
    replace: () => {},
    prefetch: async () => {},
    back: () => {},
    forward: () => {}
  };
}
export function usePathname() {
  return "/";
}
export function useSearchParams() {
  return new URLSearchParams();
}
`,
  );

  fs.writeFileSync(
    path.join(stubDir, "next-router.ts"),
    `export function useRouter() {
  return {
    push: () => {},
    replace: () => {},
    prefetch: async () => {},
    back: () => {},
    forward: () => {}
  };
}
`,
  );

  fs.writeFileSync(
    path.join(stubDir, "next-head.tsx"),
    `import React from "react";
export default function Head({ children }: any) {
  return <>{children}</>;
}
`,
  );

  fs.writeFileSync(
    path.join(stubDir, "prisma-client.ts"),
    `export const PrismaClient = function PrismaClient() {
  throw new Error("PrismaClient is not available in previews.");
};
export const Prisma = {};
export default {};
`,
  );

  fs.writeFileSync(
    path.join(stubDir, "env.ts"),
    `export function createEnv(config: any = {}) {
  const defaults = config.runtimeEnv || config.client || {};
  return new Proxy(defaults, {
    get(target, prop) {
      if (typeof prop !== "string") return undefined;
      if (prop in target) return target[prop];
      if (/URL|URI/i.test(prop)) return "https://example.com";
      return "preview";
    },
  });
}
export const env = createEnv();
export default { createEnv };
`,
  );

  fs.writeFileSync(
    path.join(stubDir, "clerk.tsx"),
    `import React from "react";
export function ClerkProvider({ children }: any) {
  return <>{children}</>;
}
export function SignedIn({ children }: any) {
  return <>{children}</>;
}
export function SignedOut({ children }: any) {
  return null;
}
export function ClerkLoaded({ children }: any) {
  return <>{children}</>;
}
export function ClerkLoading() {
  return null;
}
export function useAuth() {
  return {
    isSignedIn: false,
    userId: null,
    sessionId: null,
    getToken: async () => null,
  };
}
export function useUser() {
  return { isSignedIn: false, user: null };
}
export function useClerk() {
  return {
    openSignIn: () => {},
    openUserProfile: () => {},
    signOut: async () => {},
  };
}
export const SignIn = ({ children }: any) => <>{children}</>;
export const SignUp = ({ children }: any) => <>{children}</>;
export const SignOutButton = ({ children }: any) => <>{children}</>;
export const SignInButton = ({ children }: any) => <>{children}</>;
export const SignUpButton = ({ children }: any) => <>{children}</>;
export const UserButton = () => null;
export default { ClerkProvider };
`,
  );

  fs.writeFileSync(
    path.join(stubDir, "trpc-react.ts"),
    `import React from "react";

function makeProxy() {
  return new Proxy({}, {
    get(_target, prop) {
      if (prop === "Provider") {
        return ({ children }: any) => <>{children}</>;
      }
      if (prop === "useContext" || prop === "useUtils") {
        return () => ({});
      }
      if (
        prop === "useQuery" ||
        prop === "useMutation" ||
        prop === "useInfiniteQuery" ||
        prop === "useSuspenseQuery" ||
        prop === "useSubscription"
      ) {
        return () => ({
          data: undefined,
          error: null,
          isLoading: false,
          isFetching: false,
          mutate: () => undefined,
          mutateAsync: async () => undefined,
        });
      }
      if (prop === "createClient" || prop === "createProxySSGHelpers") {
        return () => ({});
      }
      return makeProxy();
    },
  });
}

export function createTRPCReact() {
  return makeProxy();
}

export default { createTRPCReact };
`,
  );

  fs.writeFileSync(
    path.join(stubDir, "trpc-react-ssg.ts"),
    `export function createProxySSGHelpers() {
  return {};
}
export default { createProxySSGHelpers };
`,
  );

  fs.writeFileSync(
    path.join(stubDir, "trpc-next.ts"),
    `export function withTRPC() {
  return (App: any) => App;
}

export function createTRPCNext() {
  return {
    withTRPC: () => (App: any) => App,
  };
}

export default { withTRPC, createTRPCNext };
`,
  );

  fs.writeFileSync(
    path.join(stubDir, "trpc-client.ts"),
    `export function createTRPCProxyClient() {
  return {};
}
export function httpBatchLink() {
  return {};
}
export function loggerLink() {
  return {};
}
export function httpLink() {
  return {};
}
export default {};
`,
  );

  fs.writeFileSync(
    path.join(stubDir, "trpc-server.ts"),
    `export class TRPCError extends Error {
  constructor(opts: { message?: string } = {}) {
    super(opts.message || "TRPC error");
  }
}
export function initTRPC() {
  return {};
}
export default { TRPCError, initTRPC };
`,
  );

  fs.writeFileSync(
    path.join(stubDir, "api.ts"),
    `const makeProxy = () =>
  new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === "withTRPC") {
          return () => (App: any) => App;
        }
        if (
          prop === "useQuery" ||
          prop === "useMutation" ||
          prop === "useInfiniteQuery" ||
          prop === "useSuspenseQuery" ||
          prop === "useSubscription"
        ) {
          return () => ({
            data: undefined,
            error: null,
            isLoading: false,
            isFetching: false,
            mutate: () => undefined,
            mutateAsync: async () => undefined,
          });
        }
        return makeProxy();
      },
    },
  );

export const api = makeProxy();
export default { api };
`,
  );
}

function writePreviewApp(components, globalCssPath) {
  const srcDir = path.join(PREVIEW_DIR, "src");
  const stubDir = path.join(srcDir, "stubs");
  const projectAliases = normalizeAliasEntries(getProjectAliases());
  if (projectAliases.length > 0) {
    console.log(
      `Preview aliases: ${projectAliases
        .map((alias) => alias.find)
        .join(", ")}`,
    );
  }
  fs.mkdirSync(srcDir, { recursive: true });
  writePreviewStubs(stubDir);

  if (globalCssPath) {
    console.log(`Preview global CSS: ${globalCssPath}`);
  }

  const componentEntries = components
    .map((rel) => {
      const abs = path.join(ROOT, rel);
      const name = path.basename(rel, path.extname(rel));
      return `  {\n    path: ${JSON.stringify(rel)},\n    name: ${JSON.stringify(name)},\n    importer: () => import(${JSON.stringify(toFsImportPath(abs))})\n  }`;
    })
    .join(",\n");

  const normalizedGlobalCss = writeNormalizedGlobalCss(globalCssPath);
  const globalImport = normalizedGlobalCss
    ? `import ${JSON.stringify(normalizedGlobalCss)};\n`
    : globalCssPath
      ? `import ${JSON.stringify(toFsImportPath(globalCssPath))};\n`
      : "";

  if (normalizedGlobalCss) {
    try {
      const previewCssPath = path.join(PREVIEW_DIR, "src", "preview-global.css");
      const previewCss = fs.readFileSync(previewCssPath, "utf8");
      const head = previewCss.split("\n").slice(0, 6).join("\n");
      console.log("Preview global CSS head:");
      console.log(head);
    } catch {
      // ignore
    }
  }


  const tailwindConfig = getTailwindConfigPath();
  const usesTailwind =
    Boolean(tailwindConfig) || globalCssHasTailwind(globalCssPath);
  if (usesTailwind) {
    const tailwindMajor = getTailwindMajorVersion();
    const tailwindPlugin =
      tailwindMajor && tailwindMajor >= 4 ? "@tailwindcss/postcss" : "tailwindcss";
    const previewTailwindConfig = writeTailwindPreviewConfig(tailwindConfig);
    if (previewTailwindConfig) {
      console.log(`Preview Tailwind config: ${previewTailwindConfig}`);
    }
    const tailwindConfigPath = previewTailwindConfig
      ? toPosixPath(previewTailwindConfig)
      : null;
    const tailwindPluginConfig = tailwindConfigPath
      ? `{ config: ${JSON.stringify(tailwindConfigPath)} }`
      : "{}";
    fs.writeFileSync(
      path.join(PREVIEW_DIR, "postcss.config.cjs"),
      `module.exports = {
  plugins: {
    ${JSON.stringify(tailwindPlugin)}: ${tailwindPluginConfig},
    autoprefixer: {}
  }
};
`,
    );
  }

  fs.writeFileSync(
    path.join(PREVIEW_DIR, "index.html"),
    `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Exhibit Preview</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
  );

  fs.writeFileSync(
    path.join(srcDir, "components.ts"),
    `export const components = [\n${componentEntries}\n];\n`,
  );

  fs.writeFileSync(
    path.join(srcDir, "preview-env.ts"),
    `const envProxy = new Proxy(
  { NODE_ENV: "production" },
  {
    get(target, prop) {
      if (typeof prop !== "string") return undefined;
      if (prop in target) return target[prop];
      if (/URL|URI/i.test(prop)) return "https://example.com";
      return "preview";
    },
  },
);
const globalProcess = globalThis as unknown as { process?: { env?: any } };
if (!globalProcess.process) {
  globalProcess.process = { env: envProxy };
} else if (!globalProcess.process.env) {
  globalProcess.process.env = envProxy;
}
`,
  );

  fs.writeFileSync(
    path.join(srcDir, "main.tsx"),
    `${globalImport}import "./preview-env";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./preview-app";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
}
`,
  );

  fs.writeFileSync(
    path.join(srcDir, "preview-app.tsx"),
    `import React, { useEffect, useMemo, useState } from "react";
import { components } from "./components";

type PreviewStatus = "loading" | "ready" | "error";

class PreviewErrorBoundary extends React.Component<
  { onError: (error: Error) => void; children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    this.props.onError(error);
  }
  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

function resolveProps() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("props");
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export default function App() {
  const [status, setStatus] = useState<PreviewStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [Component, setComponent] = useState<any>(null);

  const targetPath = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("path");
  }, []);
  const props = useMemo(() => resolveProps(), []);

  useEffect(() => {
    if (!targetPath) {
      setStatus("error");
      setError("Missing component path");
      return;
    }
    const entry = components.find((c) => c.path === targetPath);
    if (!entry) {
      setStatus("error");
      setError("Component not found");
      return;
    }
    entry
      .importer()
      .then((mod: any) => {
        const Exported =
          mod.default ||
          mod[Object.keys(mod).find((key) => key !== "default") || ""];
        if (!Exported) {
          throw new Error("No component export found");
        }
        setComponent(() => Exported);
        setStatus("ready");
      })
      .catch((err: Error) => {
        setStatus("error");
        setError(err.message);
      });
  }, [targetPath]);

  return (
    <div
      id="exhibit-preview"
      data-exhibit-preview={status}
      style={{
        minHeight: "100vh",
        background: "white",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      {status === "error" && (
        <div
          style={{
            border: "1px solid #e5e7eb",
            padding: "16px",
            borderRadius: "12px",
            color: "#111827",
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
          }}
        >
          Preview error: {error}
        </div>
      )}
      {status === "ready" && Component ? (
        <PreviewErrorBoundary
          onError={(err) => {
            setStatus("error");
            setError(err.message || "Render failed");
          }}
        >
          <Component {...props} />
        </PreviewErrorBoundary>
      ) : null}
    </div>
  );
}
`,
  );

  const tailwindMajor = getTailwindMajorVersion();
  fs.writeFileSync(
    path.join(PREVIEW_DIR, "vite.config.ts"),
    `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const stubAliases = ${JSON.stringify(aliasCandidates)};
const projectAliases = ${JSON.stringify(projectAliases)};
const tailwindMajor = ${JSON.stringify(tailwindMajor)};
const ENV_STUB_ID = "\\0exhibit-env";
const TRPC_SSG_STUB_ID = "\\0exhibit-trpc-ssg";
const API_STUB_ID = "\\0exhibit-api";
const API_STUB_ID = "\\0exhibit-api";

function virtualStubPlugin() {
  return {
    name: "exhibit-virtual-stubs",
    enforce: "pre",
    resolveId(id) {
      if (id === "virtual:exhibit-env") return ENV_STUB_ID;
      if (id === "virtual:exhibit-trpc-ssg") return TRPC_SSG_STUB_ID;
      if (id === "virtual:exhibit-api") return API_STUB_ID;
      if (id === "@trpc/react-query/ssg") return TRPC_SSG_STUB_ID;
      if (id === "env.mjs") return ENV_STUB_ID;
      if (id.endsWith("/env.mjs") || id.endsWith("\\\\env.mjs")) return ENV_STUB_ID;
      if (
        id.endsWith("/utils/api") ||
        id.endsWith("\\\\utils\\\\api") ||
        id.endsWith("/utils/api.ts") ||
        id.endsWith("\\\\utils\\\\api.ts")
      ) {
        return API_STUB_ID;
      }
      return null;
    },
    load(id) {
      if (id === TRPC_SSG_STUB_ID) {
        return "export function createProxySSGHelpers(){return {}}; export default { createProxySSGHelpers };";
      }
      if (id === ENV_STUB_ID) {
        return "export const env = new Proxy({}, { get: () => 'preview' }); export default { env };";
      }
      if (id === API_STUB_ID) {
        return [
          "const makeProxy = () =>",
          "  new Proxy(",
          "    {},",
          "    {",
          "      get(_target, prop) {",
          "        if (prop === \\"withTRPC\\") {",
          "          return () => (App) => App;",
          "        }",
          "        if (",
          "          prop === \\"useQuery\\" ||",
          "          prop === \\"useMutation\\" ||",
          "          prop === \\"useInfiniteQuery\\" ||",
          "          prop === \\"useSuspenseQuery\\" ||",
          "          prop === \\"useSubscription\\"",
          "        ) {",
          "          return () => ({",
          "            data: undefined,",
          "            error: null,",
          "            isLoading: false,",
          "            isFetching: false,",
          "            mutate: () => undefined,",
          "            mutateAsync: async () => undefined,",
          "          });",
          "        }",
          "        return makeProxy();",
          "      },",
          "    },",
          "  );",
          "export const api = makeProxy();",
          "export default { api };",
        ].join("\\n");
      }
      return null;
    },
  };
}

function parseImportRule(rule) {
  const match =
    /@import\\s+(?:url\\(\\s*)?(?:(['"])([^'"]+)\\1|([^'")\\s]+))(\\s*\\)?.*)?;/i.exec(
      rule,
    );
  if (!match) return null;
  return {
    rawPath: match[2] || match[3] || "",
    trailing: match[4] || "",
  };
}

function extractCharset(cssContent) {
  const match = cssContent.match(/^\\s*@charset\\s+[^;]+;\\s*/i);
  if (!match) return { charset: "", rest: cssContent };
  return { charset: match[0].trim(), rest: cssContent.slice(match[0].length) };
}

function rewriteTailwindSources(cssContent, baseDir) {
  return cssContent.replace(/@source\\s+([^;]+);/gi, (match, raw) => {
    const cleaned = raw.trim().replace(/^['"]|['"]$/g, "");
    if (
      !cleaned ||
      cleaned.startsWith("http://") ||
      cleaned.startsWith("https://") ||
      cleaned.startsWith("//") ||
      cleaned.startsWith("data:") ||
      cleaned.startsWith("/")
    ) {
      return match;
    }
    const resolved = path.resolve(baseDir, cleaned).replace(/\\\\\\\\/g, "/");
    return '@source "' + resolved + '";';
  });
}

function normalizeTailwindSyntax(cssContent, tailwindMajor, baseDir) {
  if (tailwindMajor !== 4) {
    const importRegex =
      /@import\\s+(?:url\\(\\s*)?(?:(['"])tailwindcss\\1|tailwindcss)(?:\\s+[^;]+)?;/gi;
    const replaced = cssContent.replace(
      importRegex,
      "@tailwind base;\\n@tailwind components;\\n@tailwind utilities;",
    );
    return replaced.replace(/^\\s*@source\\s+[^;]+;\\s*/gim, "");
  }
  return rewriteTailwindSources(cssContent, baseDir);
}

function extractImportsAndBody(cssContent) {
  const { charset, rest } = extractCharset(cssContent);
  const imports = [];
  const bodyParts = [];
  let i = 0;

  while (i < rest.length) {
    const next = rest.indexOf("@import", i);
    if (next === -1) {
      bodyParts.push(rest.slice(i));
      break;
    }

    bodyParts.push(rest.slice(i, next));
    let j = next + "@import".length;
    let inSingle = false;
    let inDouble = false;
    let parenDepth = 0;

    while (j < rest.length) {
      const ch = rest[j];
      if (ch === "'" && !inDouble) {
        inSingle = !inSingle;
      } else if (ch === '"' && !inSingle) {
        inDouble = !inDouble;
      } else if (!inSingle && !inDouble) {
        if (ch === "(") parenDepth += 1;
        if (ch === ")" && parenDepth > 0) parenDepth -= 1;
        if (ch === ";" && parenDepth === 0) {
          j += 1;
          break;
        }
      }
      j += 1;
    }

    const rule = rest.slice(next, j).trim();
    if (rule.startsWith("@import")) {
      imports.push(rule);
    } else {
      bodyParts.push(rule);
    }
    i = j;
  }

  const body = bodyParts.join("").trimStart();
  return { charset, imports, body };
}

function normalizeCssForVite(cssContent, baseDir, cache) {
  const normalizedCss = normalizeTailwindSyntax(
    cssContent,
    tailwindMajor,
    baseDir,
  );
  const { charset, imports, body } = extractImportsAndBody(normalizedCss);
  const mergedImports = [];
  const bodyParts = [];

  for (const rule of imports) {
    const parsed = parseImportRule(rule);
    if (!parsed) {
      mergedImports.push(rule);
      continue;
    }

    const rawPath = parsed.rawPath;
    if (
      !rawPath ||
      rawPath.startsWith("http://") ||
      rawPath.startsWith("https://") ||
      rawPath.startsWith("//") ||
      rawPath.startsWith("data:") ||
      rawPath.startsWith("/")
    ) {
      mergedImports.push(rule);
      continue;
    }

    const absPath = path.resolve(baseDir, rawPath);
    if (!fs.existsSync(absPath)) {
      mergedImports.push(rule);
      continue;
    }

    if (!cache.has(absPath)) {
      const content = fs.readFileSync(absPath, "utf8");
      cache.set(
        absPath,
        normalizeCssForVite(content, path.dirname(absPath), cache),
      );
    }

    const normalized = cache.get(absPath) || "";
    const child = extractImportsAndBody(normalized);
    if (child.imports.length > 0) {
      mergedImports.push(...child.imports);
    }
    if (child.body) {
      bodyParts.push(child.body);
    }
  }

  if (body) {
    bodyParts.push(body);
  }

  const parts = [];
  if (charset) parts.push(charset);
  if (mergedImports.length > 0) {
    const uniqueImports = Array.from(new Set(mergedImports));
    parts.push(uniqueImports.join("\\n"));
  }
  if (bodyParts.length > 0) {
    parts.push(bodyParts.join("\\n\\n"));
  }

  return parts.join("\\n\\n") + "\\n";
}

function cssNormalizePlugin() {
  const cache = new Map();
  return {
    name: "exhibit-css-normalize",
    enforce: "pre",
    load(id) {
      const filePath = id.split("?", 1)[0];
      if (!filePath.endsWith(".css")) return null;
      if (filePath.includes("node_modules")) return null;
      try {
        const content = fs.readFileSync(filePath, "utf8");
        return normalizeCssForVite(content, path.dirname(filePath), cache);
      } catch {
        return null;
      }
    },
  };
}

export default defineConfig({
  root: __dirname,
  plugins: [virtualStubPlugin(), cssNormalizePlugin(), react()],
  resolve: {
    alias: [
      { find: "@trpc/react-query/ssg", replacement: "virtual:exhibit-trpc-ssg" },
      { find: /~\\/env\\.mjs$/, replacement: "virtual:exhibit-env" },
      { find: /\\/env\\.mjs$/, replacement: "virtual:exhibit-env" },
      { find: "env.mjs", replacement: "virtual:exhibit-env" },
      { find: /utils\\/api$/, replacement: "virtual:exhibit-api" },
      ...stubAliases.map((alias) => ({
        find: alias.find,
        replacement: path.resolve(__dirname, "src/" + alias.file),
      })),
      ...projectAliases.map((alias) => ({
        find: alias.regexSource ? new RegExp(alias.regexSource) : alias.find,
        replacement: alias.replacement + (alias.needsTrailingSlash ? "/" : ""),
      })),
      ...projectAliases.some((alias) => alias.find === "@")
        ? []
        : [{ find: "@", replacement: path.resolve(repoRoot, "src") }],
    ],
  },
  server: {
    port: ${PREVIEW_PORT},
    strictPort: true,
    host: "127.0.0.1",
    fs: {
      allow: [repoRoot],
    },
  },
});
`,
  );
}

function startVite() {
  return spawn(
    process.platform === "win32" ? "npx.cmd" : "npx",
    [
      "vite",
      "--config",
      path.join(PREVIEW_DIR, "vite.config.ts"),
      "--strictPort",
      "--host",
      "127.0.0.1",
      "--port",
      String(PREVIEW_PORT),
    ],
    { stdio: "inherit" },
  );
}

async function waitForServer(retries = 30) {
  for (let i = 0; i < retries; i += 1) {
    try {
      const res = await fetch(PREVIEW_URL);
      if (res.ok) return;
    } catch {
      // ignore
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error("Preview server did not start");
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { stdio: "inherit", ...options });
    proc.on("error", reject);
    proc.on("exit", (code) => {
      if (code === 0) resolve(null);
      else reject(new Error(`${command} ${args.join(" ")} exited with ${code}`));
    });
  });
}

async function buildInteractiveBundle(components, globalCssPath) {
  if (!PREVIEW_INTERACTIVE) return null;
  console.log("Building interactive preview bundle...");
  const bundleDir = path.join(PREVIEW_DIR, "bundle");
  const distDir = path.join(bundleDir, "dist");
  const assetsDir = path.join(distDir, "assets");
  const stubRoot = path.join(bundleDir, "stubs");
  const projectAliases = normalizeAliasEntries(getProjectAliases());
  fs.mkdirSync(bundleDir, { recursive: true });
  writePreviewStubs(stubRoot);
  const bundleEnvPath = path.join(stubRoot, "env.ts");
  if (!fs.existsSync(bundleEnvPath)) {
    writePreviewStubs(stubRoot);
  }
  console.log(
    `Bundle stubs: ${stubRoot} (${fs.existsSync(bundleEnvPath) ? "ready" : "missing"})`,
  );

  const tailwindMajor = getTailwindMajorVersion();
  let bundleCss = "";
  if (globalCssPath) {
    const content = fs.readFileSync(globalCssPath, "utf8");
    const cache = new Map();
    bundleCss = normalizeCssForVite(
      content,
      path.dirname(globalCssPath),
      cache,
      tailwindMajor,
    );
  }
  fs.writeFileSync(path.join(bundleDir, "bundle-global.css"), bundleCss);

  const importLines = [];
  const entries = [];
  components.forEach((rel, index) => {
    const abs = path.join(ROOT, rel);
    entries.push(
      `  { path: ${JSON.stringify(rel)}, name: ${JSON.stringify(
        path.basename(rel, path.extname(rel)),
      )}, importer: () => import(${JSON.stringify(abs)}) }`,
    );
  });

  fs.writeFileSync(
    path.join(bundleDir, "bundle-components.ts"),
    `export const components = [\n${entries.join(",\n")}\n];\n`,
  );

  fs.writeFileSync(
    path.join(bundleDir, "bundle-app.tsx"),
    `import React, { useEffect, useMemo, useState } from "react";
import { components } from "./bundle-components";

type PreviewStatus = "loading" | "ready" | "error";

class PreviewErrorBoundary extends React.Component<
  { onError: (error: Error) => void; children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    this.props.onError(error);
  }
  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

function resolveTargetPath() {
  const win = window as any;
  if (win.__EXHIBIT_COMPONENT_PATH__) return win.__EXHIBIT_COMPONENT_PATH__;
  const params = new URLSearchParams(window.location.search);
  return params.get("path");
}

function resolveProps() {
  const win = window as any;
  if (win.__EXHIBIT_COMPONENT_PROPS__) return win.__EXHIBIT_COMPONENT_PROPS__;
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("props");
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export default function BundleApp() {
  const [status, setStatus] = useState<PreviewStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [Component, setComponent] = useState<any>(null);

  const targetPath = useMemo(() => resolveTargetPath(), []);
  const props = useMemo(() => resolveProps(), []);

  useEffect(() => {
    if (!targetPath) {
      setStatus("error");
      setError("Missing component path");
      return;
    }
    const entry = components.find((c) => c.path === targetPath);
    if (!entry) {
      setStatus("error");
      setError("Component not found");
      return;
    }
    entry
      .importer()
      .then((mod: any) => {
        const Exported =
          mod.default ||
          mod[Object.keys(mod).find((key) => key !== "default") || ""];
        if (!Exported) {
          throw new Error("No component export found");
        }
        setComponent(() => Exported);
        setStatus("ready");
      })
      .catch((err: Error) => {
        setStatus("error");
        setError(err.message);
      });
  }, [targetPath]);

  return (
    <div
      id="exhibit-preview"
      data-exhibit-preview={status}
      style={{
        minHeight: "100vh",
        background: "white",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      {status === "error" && (
        <div
          style={{
            border: "1px solid #e5e7eb",
            padding: "16px",
            borderRadius: "12px",
            color: "#111827",
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
          }}
        >
          Preview error: {error}
        </div>
      )}
      {status === "ready" && Component ? (
        <PreviewErrorBoundary
          onError={(err) => {
            setStatus("error");
            setError(err.message || "Render failed");
          }}
        >
          <Component {...props} />
        </PreviewErrorBoundary>
      ) : null}
    </div>
  );
}
`,
  );

  fs.writeFileSync(
    path.join(bundleDir, "bundle-env.ts"),
    `const envProxy = new Proxy(
  { NODE_ENV: "production" },
  {
    get(target, prop) {
      if (typeof prop !== "string") return undefined;
      if (prop in target) return target[prop];
      if (/URL|URI/i.test(prop)) return "https://example.com";
      return "preview";
    },
  },
);
const globalProcess = globalThis as unknown as { process?: { env?: any } };
if (!globalProcess.process) {
  globalProcess.process = { env: envProxy };
} else if (!globalProcess.process.env) {
  globalProcess.process.env = envProxy;
}
`,
  );

  fs.writeFileSync(
    path.join(bundleDir, "bundle-main.tsx"),
    `import "./bundle-env";
import React from "react";
import { createRoot } from "react-dom/client";
import BundleApp from "./bundle-app";
import "./bundle-global.css";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<BundleApp />);
}
`,
  );

  fs.writeFileSync(
    path.join(bundleDir, "index.html"),
    `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Exhibit Preview</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/bundle-main.tsx"></script>
  </body>
</html>
`,
  );

  fs.writeFileSync(
    path.join(bundleDir, "vite.config.ts"),
    `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");
const stubRoot = path.resolve(__dirname, "stubs");
const projectAliases = ${JSON.stringify(projectAliases)};
const tailwindMajor = ${JSON.stringify(tailwindMajor)};
const ENV_STUB_ID = "\\0exhibit-env";
const TRPC_SSG_STUB_ID = "\\0exhibit-trpc-ssg";

function virtualStubPlugin() {
  return {
    name: "exhibit-virtual-stubs",
    enforce: "pre",
    resolveId(id) {
      if (id === "virtual:exhibit-env") return ENV_STUB_ID;
      if (id === "virtual:exhibit-trpc-ssg") return TRPC_SSG_STUB_ID;
      if (id === "virtual:exhibit-api") return API_STUB_ID;
      if (id === "@trpc/react-query/ssg") return TRPC_SSG_STUB_ID;
      if (id === "env.mjs") return ENV_STUB_ID;
      if (id.endsWith("/env.mjs") || id.endsWith("\\\\env.mjs")) return ENV_STUB_ID;
      if (
        id.endsWith("/utils/api") ||
        id.endsWith("\\\\utils\\\\api") ||
        id.endsWith("/utils/api.ts") ||
        id.endsWith("\\\\utils\\\\api.ts")
      ) {
        return API_STUB_ID;
      }
      return null;
    },
    load(id) {
      if (id === TRPC_SSG_STUB_ID) {
        return "export function createProxySSGHelpers(){return {}}; export default { createProxySSGHelpers };";
      }
      if (id === ENV_STUB_ID) {
        return "export const env = new Proxy({}, { get: () => 'preview' }); export default { env };";
      }
      if (id === API_STUB_ID) {
        return [
          "const makeProxy = () =>",
          "  new Proxy(",
          "    {},",
          "    {",
          "      get(_target, prop) {",
          "        if (prop === \\"withTRPC\\") {",
          "          return () => (App) => App;",
          "        }",
          "        if (",
          "          prop === \\"useQuery\\" ||",
          "          prop === \\"useMutation\\" ||",
          "          prop === \\"useInfiniteQuery\\" ||",
          "          prop === \\"useSuspenseQuery\\" ||",
          "          prop === \\"useSubscription\\"",
          "        ) {",
          "          return () => ({",
          "            data: undefined,",
          "            error: null,",
          "            isLoading: false,",
          "            isFetching: false,",
          "            mutate: () => undefined,",
          "            mutateAsync: async () => undefined,",
          "          });",
          "        }",
          "        return makeProxy();",
          "      },",
          "    },",
          "  );",
          "export const api = makeProxy();",
          "export default { api };",
        ].join("\\n");
      }
      return null;
    },
  };
}

function parseImportRule(rule) {
  const match =
    /@import\\s+(?:url\\(\\s*)?(?:(['"])([^'"]+)\\1|([^'")\\s]+))(\\s*\\)?.*)?;/i.exec(
      rule,
    );
  if (!match) return null;
  return {
    rawPath: match[2] || match[3] || "",
    trailing: match[4] || "",
  };
}

function extractCharset(cssContent) {
  const match = cssContent.match(/^\\s*@charset\\s+[^;]+;\\s*/i);
  if (!match) return { charset: "", rest: cssContent };
  return { charset: match[0].trim(), rest: cssContent.slice(match[0].length) };
}

function rewriteTailwindSources(cssContent, baseDir) {
  return cssContent.replace(/@source\\s+([^;]+);/gi, (match, raw) => {
    const cleaned = raw.trim().replace(/^['"]|['"]$/g, "");
    if (
      !cleaned ||
      cleaned.startsWith("http://") ||
      cleaned.startsWith("https://") ||
      cleaned.startsWith("//") ||
      cleaned.startsWith("data:") ||
      cleaned.startsWith("/")
    ) {
      return match;
    }
    const resolved = path.resolve(baseDir, cleaned).replace(/\\\\\\\\/g, "/");
    return '@source "' + resolved + '";';
  });
}

function normalizeTailwindSyntax(cssContent, tailwindMajor, baseDir) {
  if (tailwindMajor !== 4) {
    const importRegex =
      /@import\\s+(?:url\\(\\s*)?(?:(['"])tailwindcss\\1|tailwindcss)(?:\\s+[^;]+)?;/gi;
    const replaced = cssContent.replace(
      importRegex,
      "@tailwind base;\\n@tailwind components;\\n@tailwind utilities;",
    );
    return replaced.replace(/^\\s*@source\\s+[^;]+;\\s*/gim, "");
  }
  return rewriteTailwindSources(cssContent, baseDir);
}

function extractImportsAndBody(cssContent) {
  const { charset, rest } = extractCharset(cssContent);
  const imports = [];
  const bodyParts = [];
  let i = 0;

  while (i < rest.length) {
    const next = rest.indexOf("@import", i);
    if (next === -1) {
      bodyParts.push(rest.slice(i));
      break;
    }

    bodyParts.push(rest.slice(i, next));
    let j = next + "@import".length;
    let inSingle = false;
    let inDouble = false;
    let parenDepth = 0;

    while (j < rest.length) {
      const ch = rest[j];
      if (ch === "'" && !inDouble) {
        inSingle = !inSingle;
      } else if (ch === '"' && !inSingle) {
        inDouble = !inDouble;
      } else if (!inSingle && !inDouble) {
        if (ch === "(") parenDepth += 1;
        if (ch === ")" && parenDepth > 0) parenDepth -= 1;
        if (ch === ";" && parenDepth === 0) {
          j += 1;
          break;
        }
      }
      j += 1;
    }

    const rule = rest.slice(next, j).trim();
    if (rule.startsWith("@import")) {
      imports.push(rule);
    } else {
      bodyParts.push(rule);
    }
    i = j;
  }

  const body = bodyParts.join("").trimStart();
  return { charset, imports, body };
}

function normalizeCssForVite(cssContent, baseDir, cache) {
  const normalizedCss = normalizeTailwindSyntax(cssContent, tailwindMajor, baseDir);
  const { charset, imports, body } = extractImportsAndBody(normalizedCss);
  const mergedImports = [];
  const bodyParts = [];

  for (const rule of imports) {
    const parsed = parseImportRule(rule);
    if (!parsed) {
      mergedImports.push(rule);
      continue;
    }

    const rawPath = parsed.rawPath;
    if (
      !rawPath ||
      rawPath.startsWith("http://") ||
      rawPath.startsWith("https://") ||
      rawPath.startsWith("//") ||
      rawPath.startsWith("data:") ||
      rawPath.startsWith("/")
    ) {
      mergedImports.push(rule);
      continue;
    }

    const absPath = path.resolve(baseDir, rawPath);
    if (!fs.existsSync(absPath)) {
      mergedImports.push(rule);
      continue;
    }

    if (!cache.has(absPath)) {
      const content = fs.readFileSync(absPath, "utf8");
      cache.set(
        absPath,
        normalizeCssForVite(content, path.dirname(absPath), cache),
      );
    }

    const normalized = cache.get(absPath) || "";
    const child = extractImportsAndBody(normalized);
    if (child.imports.length > 0) {
      mergedImports.push(...child.imports);
    }
    if (child.body) {
      bodyParts.push(child.body);
    }
  }

  if (body) {
    bodyParts.push(body);
  }

  const parts = [];
  if (charset) parts.push(charset);
  if (mergedImports.length > 0) {
    const uniqueImports = Array.from(new Set(mergedImports));
    parts.push(uniqueImports.join("\\n"));
  }
  if (bodyParts.length > 0) {
    parts.push(bodyParts.join("\\n\\n"));
  }

  return parts.join("\\n\\n") + "\\n";
}

function cssNormalizePlugin() {
  const cache = new Map();
  return {
    name: "exhibit-css-normalize",
    enforce: "pre",
    load(id) {
      const filePath = id.split("?", 1)[0];
      if (!filePath.endsWith(".css")) return null;
      if (filePath.includes("node_modules")) return null;
      try {
        const content = fs.readFileSync(filePath, "utf8");
        return normalizeCssForVite(content, path.dirname(filePath), cache);
      } catch {
        return null;
      }
    },
  };
}

export default defineConfig({
  root: __dirname,
  plugins: [virtualStubPlugin(), cssNormalizePlugin(), react()],
  css: {
    postcss: path.resolve(repoRoot, ".exhibit-preview", "postcss.config.cjs"),
  },
  resolve: {
    alias: [
      { find: /\\/env\\.mjs$/, replacement: "virtual:exhibit-env" },
      { find: "@trpc/react-query/ssg", replacement: "virtual:exhibit-trpc-ssg" },
      { find: "next/link", replacement: path.join(stubRoot, "next-link.tsx") },
      { find: "next/image", replacement: path.join(stubRoot, "next-image.tsx") },
      { find: "next/navigation", replacement: path.join(stubRoot, "next-navigation.ts") },
      { find: "next/router", replacement: path.join(stubRoot, "next-router.ts") },
      { find: "next/head", replacement: path.join(stubRoot, "next-head.tsx") },
      { find: ".prisma/client/index-browser", replacement: path.join(stubRoot, "prisma-client.ts") },
      { find: "@prisma/client", replacement: path.join(stubRoot, "prisma-client.ts") },
      { find: "@t3-oss/env-nextjs", replacement: path.join(stubRoot, "env.ts") },
      { find: "@t3-oss/env-core", replacement: path.join(stubRoot, "env.ts") },
      { find: "@clerk/nextjs", replacement: path.join(stubRoot, "clerk.tsx") },
      { find: "@clerk/clerk-react", replacement: path.join(stubRoot, "clerk.tsx") },
      { find: "@trpc/react-query", replacement: path.join(stubRoot, "trpc-react.ts") },
      { find: "@trpc/react-query/ssg", replacement: path.join(stubRoot, "trpc-react-ssg.ts") },
      { find: "@trpc/next", replacement: path.join(stubRoot, "trpc-next.ts") },
      { find: "@trpc/client", replacement: path.join(stubRoot, "trpc-client.ts") },
      { find: "@trpc/server", replacement: path.join(stubRoot, "trpc-server.ts") },
      { find: /~\\/env\\.mjs$/, replacement: "virtual:exhibit-env" },
      { find: "env.mjs", replacement: "virtual:exhibit-env" },
      { find: "~/utils/api", replacement: path.join(stubRoot, "api.ts") },
      { find: "@/utils/api", replacement: path.join(stubRoot, "api.ts") },
      { find: /utils\\/api$/, replacement: "virtual:exhibit-api" },
      ...projectAliases.map((alias) => ({
        find: alias.regexSource ? new RegExp(alias.regexSource) : alias.find,
        replacement: alias.replacement + (alias.needsTrailingSlash ? "/" : ""),
      })),
      ...projectAliases.some((alias) => alias.find === "@")
        ? []
        : [{ find: "@", replacement: path.resolve(repoRoot, "src") }],
    ],
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    cssCodeSplit: false,
    sourcemap: false,
    minify: "esbuild",
    assetsInlineLimit: 10000000,
    rollupOptions: {
      input: path.resolve(__dirname, "index.html"),
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
`,
  );

  const command = process.platform === "win32" ? "npx.cmd" : "npx";
  await runCommand(
    command,
    ["vite", "build", "--config", path.join(bundleDir, "vite.config.ts")],
    { cwd: bundleDir },
  );

  const jsFiles = fs.existsSync(assetsDir)
    ? fs.readdirSync(assetsDir).filter((file) => file.endsWith(".js"))
    : [];
  const cssFiles = fs.existsSync(assetsDir)
    ? fs.readdirSync(assetsDir).filter((file) => file.endsWith(".css"))
    : [];

  const js = jsFiles
    .map((file) => fs.readFileSync(path.join(assetsDir, file), "utf8"))
    .join("\n");
  const css = cssFiles
    .map((file) => fs.readFileSync(path.join(assetsDir, file), "utf8"))
    .join("\n");

  if (!js) return null;

  console.log(
    `Interactive bundle ready (js ${js.length} chars, css ${css.length} chars).`,
  );
  return { js, css };
}

function buildInteractiveHtml(bundle, componentPath) {
  if (!bundle) return null;
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Exhibit Preview</title>
    <style>
${bundle.css || ""}
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script>
      window.__EXHIBIT_COMPONENT_PATH__ = ${JSON.stringify(componentPath)};
    </script>
    <script type="module">
${bundle.js}
    </script>
  </body>
</html>`;
  return `data:text/html;base64,${Buffer.from(html).toString("base64")}`;
}

async function renderScreenshots(componentPaths) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const assets = [];
  console.log(`Rendering ${componentPaths.length} component previews...`);
  let currentComponent = "unknown";

  page.on("pageerror", (err) => {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`Page error [${currentComponent}]: ${message}`);
  });
  page.on("console", (msg) => {
    const type = msg.type();
    if (type === "error" || type === "warning") {
      console.warn(`Console ${type} [${currentComponent}]: ${msg.text()}`);
    }
  });

  for (let i = 0; i < componentPaths.length; i += 1) {
    const rel = componentPaths[i];
    currentComponent = rel;
    console.log(`Rendering (${i + 1}/${componentPaths.length}) ${rel}`);
    const url = `${PREVIEW_URL}/?path=${encodeURIComponent(rel)}`;
    try {
      await page.goto(url, { waitUntil: "networkidle" });
      await page.waitForSelector(
        '[data-exhibit-preview="ready"], [data-exhibit-preview="error"]',
        {
          timeout: 15000,
        },
      );
      const status =
        (await page.getAttribute("#exhibit-preview", "data-exhibit-preview")) ||
        "error";
      if (status !== "ready") {
        const errorText = await page
          .locator("#exhibit-preview")
          .innerText()
          .catch(() => "");
        const message = errorText.trim() || "Preview error";
        assets.push({
          componentPath: rel,
          status: "FAILED",
          errorMessage: message,
        });
        console.warn(`Preview error for ${rel}: ${message}`);
        continue;
      }
      const locator = page.locator("#exhibit-preview");
      const buffer = await locator.screenshot({ type: "jpeg", quality: 80 });
      const dataUrl = `data:image/jpeg;base64,${buffer.toString("base64")}`;
      assets.push({
        componentPath: rel,
        imageUrl: dataUrl,
        status: "COMPLETED",
      });
      console.log(`Rendered ${rel}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Render failed";
      console.warn(`Render failed for ${rel}: ${message}`);
      assets.push({
        componentPath: rel,
        status: "FAILED",
        errorMessage: message,
      });
    }
  }

  await browser.close();
  return assets;
}

async function uploadBatch(assets, jobId, bundle) {
  console.log(
    `Uploading batch (${assets.length} assets${bundle ? ", bundle included" : ""})...`,
  );
  const payload = {
    repositoryFullName: REPO_FULL_NAME,
    commitSha: COMMIT_SHA,
    assets,
    bundle: bundle || undefined,
    jobId: jobId || undefined,
  };

  const res = await fetch(PREVIEW_UPLOAD_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-preview-token": PREVIEW_UPLOAD_TOKEN,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`Upload failed with status ${res.status}: ${text}`);
    throw new Error(`Upload failed (${res.status}): ${text}`);
  }
  const data = await res.json().catch(() => ({}));
  if (data?.assetsSaved !== undefined) {
    console.log(
      `Upload success: jobId=${data?.jobId || jobId || "new"} assetsSaved=${data.assetsSaved}`,
    );
  } else {
    console.log(`Upload success: jobId=${data?.jobId || jobId || "new"}`);
  }
  if (data?.jobId) {
    return data.jobId;
  }
  return jobId;
}

async function upload(assets, bundle) {
  const completedCount = assets.filter((asset) => asset.status === "COMPLETED")
    .length;
  const failed = assets.filter((asset) => asset.status === "FAILED");
  console.log(
    `Uploading previews (${completedCount} completed, ${failed.length} failed).`,
  );
  if (failed.length > 0) {
    const sample = failed
      .slice(0, 5)
      .map((asset) => `${asset.componentPath}: ${asset.errorMessage || "failed"}`)
      .join("; ");
    console.warn(`Failed preview samples: ${sample}`);
  }
  let jobId;
  if (bundle) {
    jobId = await uploadBatch([], jobId, bundle);
  }
  for (let i = 0; i < assets.length; i += UPLOAD_BATCH_SIZE) {
    const batch = assets.slice(i, i + UPLOAD_BATCH_SIZE);
    jobId = await uploadBatch(batch, jobId);
  }
  console.log("Uploaded previews");
}

async function main() {
  const components = findComponents().map((filePath) =>
    path.relative(ROOT, filePath).replace(/\\/g, "/"),
  );
  if (components.length === 0) {
    console.log("No components found");
    return;
  }
  console.log(`Found ${components.length} component files.`);

  if (fs.existsSync(PREVIEW_DIR)) {
    fs.rmSync(PREVIEW_DIR, { recursive: true, force: true });
  }

  const globalCssPath = findGlobalCss();
  if (globalCssPath) {
    console.log(`Detected global CSS at ${globalCssPath}`);
  } else {
    console.log("No global CSS detected.");
  }
  writePreviewApp(components, globalCssPath);

  let interactiveBundle = null;
  try {
    interactiveBundle = await buildInteractiveBundle(components, globalCssPath);
  } catch (err) {
    console.warn("Interactive bundle build failed:", err);
  }

  const viteProcess = startVite();
  try {
    await waitForServer();
    const assets = await renderScreenshots(components);
    await upload(assets, interactiveBundle);
  } finally {
    viteProcess.kill();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
