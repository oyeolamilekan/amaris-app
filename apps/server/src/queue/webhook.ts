import { Queue, Worker, Job } from "bullmq";
import { connection } from "./config";
import { addCredits } from "../services";
import { db, eq } from "@amaris/db";
import { user, creditPackage } from "@amaris/db/schema/auth";

export const WEBHOOK_QUEUE_NAME = "webhook-processing";

export const webhookQueue = new Queue(WEBHOOK_QUEUE_NAME, {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

interface WebhookJobData {
  eventType: string;
  payload: any;
}

/**
 * Handle order.created event
 * Adds credits to the user based on the purchased product
 */
const handleOrderCreated = async (order: any) => {
  const productId = order.productId;
  console.log(`[Worker] Processing order.created for product: ${productId}`);

  const userEmail = order.customer.email;
  const metadata = order.metadata || {};
  // Polar metadata keys are strings, but let's be safe with access
  const userId = String(metadata.userId || metadata.user_id || "");

  let userRecord;

  // 1. Try to find user by ID from metadata (most reliable)
  if (userId) {
    console.log(`[Worker] Looking up user by ID from metadata: ${userId}`);
    [userRecord] = await db.select().from(user).where(eq(user.id, userId));
  }

  // 2. Fallback to email lookup if ID lookup failed or wasn't provided
  if (!userRecord) {
    console.log(`[Worker] Looking up user by email: ${userEmail}`);
    [userRecord] = await db
      .select()
      .from(user)
      .where(eq(user.email, userEmail));
  }

  if (!userRecord) {
    console.warn(
      `[Worker] User not found for email: ${userEmail} (ID: ${userId})`,
    );
    // We might want to throw here to retry if it's a timing issue,
    // but for now let's just log and return to avoid infinite retries on bad data
    return;
  }

  if (!productId) {
    console.warn("[Worker] Product ID missing in order");
    return;
  }

  // 3. Determine credits to add
  let creditsToAdd = 0;

  // Check DB for dynamic package configuration first
  const [dbPkg] = await db
    .select()
    .from(creditPackage)
    .where(eq(creditPackage.polarProductId, productId));

  if (dbPkg) {
    creditsToAdd = dbPkg.credits;
  }

  if (creditsToAdd > 0) {
    console.log(
      `[Worker] Adding ${creditsToAdd} credits to user ${userRecord.id}`,
    );
    await addCredits(userRecord.id, creditsToAdd);
  } else {
    console.warn(
      `[Worker] Unknown product ID: ${productId} - no credits assigned`,
    );
  }
};

export const webhookWorker = new Worker<WebhookJobData>(
  WEBHOOK_QUEUE_NAME,
  async (job: Job<WebhookJobData>) => {
    const { eventType, payload } = job.data;

    console.log(`[Worker] Processing job ${job.id} - Event: ${eventType}`);

    try {
      switch (eventType) {
        case "order.created":
          await handleOrderCreated(payload);
          break;
        default:
          console.log(`[Worker] Unhandled event type: ${eventType}`);
      }
    } catch (error) {
      console.error(`[Worker] Error processing job ${job.id}:`, error);
      throw error; // Re-throw to trigger retry mechanism
    }
  },
  {
    connection,
    concurrency: 5, // Process up to 5 webhooks concurrently
  },
);

// Handle worker events
webhookWorker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} completed successfully`);
});

webhookWorker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed with error: ${err.message}`);
});
