import crypto from "node:crypto";

const RESET_TOKEN_BYTES = 32;
const RESET_TOKEN_TTL_MS = 1000 * 60 * 30;

export function createPasswordResetToken() {
  const rawToken = crypto.randomBytes(RESET_TOKEN_BYTES).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  return {
    rawToken,
    hashedToken,
    expiresAt 
  };
}

export function hashPasswordResetToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}



export function getWebPasswordResetUrl(token: string) {
  const baseUrl =
    process.env.APP_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  return `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;
}

export function getPasswordResetLinks(token: string) {
  return {
    webResetUrl: getWebPasswordResetUrl(token),
  };
}
