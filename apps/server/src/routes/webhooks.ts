import { Hono } from "hono";
import {
  validateEvent,
  WebhookVerificationError,
} from "@polar-sh/sdk/webhooks";
import { webhookQueue } from "../queue/webhook";

const app = new Hono();

app.post("/polar", async (c) => {
  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[Webhook] POLAR_WEBHOOK_SECRET is not set");
    return c.json({ error: "Configuration error" }, 500);
  }

  const body = await c.req.text();
  const headers = c.req.header();

  try {
    // Verify signature using @polar-sh/sdk
    const event = validateEvent(body, headers, webhookSecret);

    console.log(`[Webhook] Received event: ${event.type}`);

    // Add job to queue
    await webhookQueue.add(event.type, {
      eventType: event.type,
      payload: event.data,
    });

    console.log(`[Webhook] Queued job for event: ${event.type}`);

    return c.json({ received: true });
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      console.error("[Webhook] Verification failed:", error.message);
      return c.json({ error: "Invalid signature" }, 403);
    }

    console.error("[Webhook] Processing error:", error);
    return c.json({ error: "Webhook failed" }, 400);
  }
});

export default app;
