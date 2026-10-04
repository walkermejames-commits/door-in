/**
 * GitHub's REST API and remote connector both require an Authorization
 * value of exactly `Bearer <token>`: one scheme, one credential, no extra
 * whitespace. `Authorization: Bearer ${token}` copies the secret through
 * unchanged, so a pasted scheme, wrapping quotes, or a trailing newline
 * (common when a secret is set from a shell) is sent as-is.
 *
 * Those shapes are what the connector rejects as
 * "Authorization header is badly formatted":
 * - `Bearer Bearer <token>` is three fields, not two
 * - `Bearer <token>\n` is an illegal header value
 */
const LEADING_SCHEME = /^(?:bearer|token)(?:\s+|$)/i;

export function githubAuthorizationHeader(rawToken: string): string {
  let token = rawToken.trim();
  if (
    (token.startsWith('"') && token.endsWith('"') && token.length >= 2) ||
    (token.startsWith("'") && token.endsWith("'") && token.length >= 2)
  ) {
    token = token.slice(1, -1).trim();
  }
  while (LEADING_SCHEME.test(token)) {
    token = token.replace(/^(?:bearer|token)\s*/i, "").trim();
  }
  if (!token || /\s/.test(token)) {
    throw new Error("GitHub token is not a single Authorization credential.");
  }
  return `Bearer ${token}`;
}
