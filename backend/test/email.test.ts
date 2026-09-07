import assert from "node:assert/strict";
import test from "node:test";
import { brevoConfigured } from "../src/config/env.js";
import { sendOrderStatusEmailOnce } from "../src/services/emailService.js";

test("transactional order email safely skips when Brevo is not configured", async () => {
  assert.equal(brevoConfigured, false);
  const result = await sendOrderStatusEmailOnce("not-a-real-order", "CONFIRMED");
  assert.deepEqual(result, {
    skipped: true,
    reason: "BREVO_NOT_CONFIGURED",
  });
});
