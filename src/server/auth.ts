import { verifyToken } from "@clerk/backend";
import type { NextApiRequest } from "next";

/** Verify the session in the API itself, without trusting middleware headers. */
export const getRequestUserId = async (
  req: Pick<NextApiRequest, "cookies" | "headers">
): Promise<string | null> => {
  const authorization = req.headers.authorization;
  const bearerToken = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : undefined;
  const token = req.cookies.__session || bearerToken;
  const secretKey = process.env.CLERK_SECRET_KEY;

  if (!token || !secretKey) return null;

  try {
    // Fetch keys for our Clerk instance, never from a token-supplied issuer URL.
    const claims = await verifyToken(token, { secretKey, issuer: null });
    return claims.sub;
  } catch {
    // Invalid, expired or unverifiable sessions never receive admin access.
    return null;
  }
};
