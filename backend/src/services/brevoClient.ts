import { brevoConfigured, env } from "../config/env.js";

const BREVO_SEND_URL = "https://api.brevo.com/v3/smtp/email";
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

export type BrevoMessage = {
  to: { email: string; name?: string };
  subject: string;
  htmlContent: string;
  textContent: string;
  idempotencyKey: string;
};

export function isBrevoConfigured() {
  return brevoConfigured;
}

function retryDelayMs(response: Response, attempt: number) {
  const retryAfter = Number(response.headers.get("retry-after"));
  if (Number.isFinite(retryAfter) && retryAfter > 0) {
    return Math.min(retryAfter * 1000, 5000);
  }
  const reset = Number(response.headers.get("x-sib-ratelimit-reset"));
  if (Number.isFinite(reset) && reset > 0) {
    return Math.min(reset * 1000, 5000);
  }
  return Math.min(400 * 2 ** attempt, 2500);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendBrevoTransactionalEmail(message: BrevoMessage) {
  if (!brevoConfigured || !env.BREVO_API_KEY || !env.BREVO_SENDER_EMAIL) {
    throw new Error("Brevo transactional email is not configured.");
  }

  const payload = {
    sender: {
      email: env.BREVO_SENDER_EMAIL,
      name: env.BREVO_SENDER_NAME,
    },
    to: [message.to],
    ...(env.BREVO_REPLY_TO_EMAIL ? { replyTo: { email: env.BREVO_REPLY_TO_EMAIL } } : {}),
    subject: message.subject,
    htmlContent: message.htmlContent,
    textContent: message.textContent,
    headers: {
      "Idempotency-Key": message.idempotencyKey,
    },
  };

  let lastStatus = 0;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    let response: Response;
    try {
      response = await fetch(BREVO_SEND_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "api-key": env.BREVO_API_KEY,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10_000),
      });
    } catch (error) {
      if (attempt < 2) {
        await sleep(Math.min(400 * 2 ** attempt, 1600));
        continue;
      }
      throw new Error(error instanceof Error ? `Brevo request failed: ${error.name}` : "Brevo request failed.");
    }

    lastStatus = response.status;
    if (response.ok) {
      const body = (await response.json().catch(() => null)) as { messageId?: string } | null;
      if (!body?.messageId) throw new Error("Brevo accepted the email but returned no message id.");
      return { messageId: body.messageId };
    }

    if (!RETRYABLE_STATUS.has(response.status) || attempt === 2) break;
    await sleep(retryDelayMs(response, attempt));
  }

  throw new Error(`Brevo transactional email failed with status ${lastStatus || "unknown"}.`);
}
