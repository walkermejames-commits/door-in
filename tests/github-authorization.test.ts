import assert from "node:assert/strict";
import test from "node:test";
import { githubAuthorizationHeader } from "../src/lib/github-authorization";

const token = "ghp_exampletoken";

test("a raw GitHub token is sent as a single Bearer credential", () => {
  assert.equal(githubAuthorizationHeader(token), `Bearer ${token}`);
});

test("a secret pasted with a Bearer prefix is not double-prefixed", () => {
  assert.equal(githubAuthorizationHeader(`Bearer ${token}`), `Bearer ${token}`);
  assert.equal(githubAuthorizationHeader(`bearer  ${token}`), `Bearer ${token}`);
  assert.equal(githubAuthorizationHeader(`Bearer Bearer ${token}`), `Bearer ${token}`);
});

test("a legacy token scheme is normalised to Bearer", () => {
  assert.equal(githubAuthorizationHeader(`token ${token}`), `Bearer ${token}`);
});

test("wrapping quotes and a trailing newline are not copied into the header", () => {
  assert.equal(githubAuthorizationHeader(`"${token}"`), `Bearer ${token}`);
  assert.equal(githubAuthorizationHeader(`'${token}'\n`), `Bearer ${token}`);
  assert.equal(githubAuthorizationHeader(`${token}\r\n`), `Bearer ${token}`);
});

test("the old interpolation would have sent the malformed header", () => {
  const pasted = `Bearer ${token}\n`;
  assert.equal(`Bearer ${pasted}`, `Bearer Bearer ${token}\n`);
  assert.equal(githubAuthorizationHeader(pasted), `Bearer ${token}`);
});

test("a blank or multi-value secret is refused before a request is sent", () => {
  assert.throws(() => githubAuthorizationHeader("   \n"), /single Authorization credential/);
  assert.throws(() => githubAuthorizationHeader("Bearer "), /single Authorization credential/);
  assert.throws(() => githubAuthorizationHeader(`${token} ${token}`), /single Authorization credential/);
});
