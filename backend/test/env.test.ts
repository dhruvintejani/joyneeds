import assert from "node:assert/strict";
import test from "node:test";
import { parseBackendEnv } from "../src/config/env.js";
const minimal = { DATABASE_URL: "postgresql://test:test@localhost:5432/test" };

test("copied example blanks do not enable optional services or fail validation", () => {
  const result = parseBackendEnv({ ...minimal, ADMIN_EMAIL: "", ADMIN_PASSWORD_HASH: " ", CLERK_SECRET_KEY: "", CLERK_PUBLISHABLE_KEY: "", PAYTM_CALLBACK_URL: "", BREVO_SENDER_EMAIL: "", BREVO_REPLY_TO_EMAIL: "", CLOUDINARY_API_KEY: "" });
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.ADMIN_EMAIL, undefined);
    assert.equal(result.data.PAYTM_CALLBACK_URL, undefined);
    assert.equal(result.data.ORDER_CREATION_ENABLED, "false");
  }
});
test("partial credentials and plaintext admin passwords are rejected", () => {
  assert.equal(parseBackendEnv({ ...minimal, CLERK_PUBLISHABLE_KEY: "pk_test_example" }).success, false);
  assert.equal(parseBackendEnv({ ...minimal, ADMIN_EMAIL: "admin@example.com", ADMIN_PASSWORD_HASH: "plaintext" }).success, false);
  assert.equal(parseBackendEnv({ ...minimal, PAYTM_MID: "example" }).success, false);
});
test("frontend origin is normalized and production rejects insecure origins", () => {
  const result = parseBackendEnv({ ...minimal, FRONTEND_URL: "https://example.com/" });
  assert.equal(result.success && result.data.FRONTEND_URL, "https://example.com");
  assert.equal(parseBackendEnv({ ...minimal, NODE_ENV: "production", FRONTEND_URL: "http://example.com" }).success, false);
  assert.equal(parseBackendEnv({ ...minimal, FRONTEND_URL: "https://example.com/path" }).success, false);
  assert.equal(parseBackendEnv({ ...minimal, FRONTEND_URL: "not-a-url" }).success, false);
  assert.equal(parseBackendEnv({ DATABASE_URL: "" }).success, false);
});
