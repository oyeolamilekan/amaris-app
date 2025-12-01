import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const chat = pgTable("chat", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  draft: text("draft").default(""),
  isGenerating: boolean("is_generating").notNull().default(false),
  modelId: text("model_id").notNull().default("gemini-2.0-flash-exp"),
  modelType: text("model_type")
    .notNull()
    .default("google:gemini-2.0-flash-exp"),
  // Configuration
  imageCount: integer("image_count").notNull().default(1),
  outputStyle: text("output_style").notNull().default("realistic"),
  styleImageUrl: text("style_image_url"),
  styleImageName: text("style_image_name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const chatMessage = pgTable("chat_message", {
  id: text("id").primaryKey(),
  chatId: text("chat_id")
    .notNull()
    .references(() => chat.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // "user" | "assistant"
  content: text("content").notNull(),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  status: text("status"), // "pending" | "completed" | "failed"
  error: text("error"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const generation = pgTable("generation", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  chatId: text("chat_id").references(() => chat.id, { onDelete: "set null" }),
  prompt: text("prompt").notNull(),
  styleImageUrl: text("style_image_url").notNull(),
  model: text("model").notNull(), // AI model used
  outputStyle: text("output_style"), // "realistic", "artistic", "anime", "cartoon", "svg", etc.
  status: text("status").notNull().default("pending"), // "pending", "processing", "completed", "failed"
  generatedImageUrl: text("generated_image_url"),
  errorMessage: text("error_message"),
  metadata: jsonb("metadata"), // Store additional generation metadata
  creditsUsed: integer("credits_used").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const styleReference = pgTable("style_reference", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  description: text("description"),
  usageCount: integer("usage_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const userCredits = pgTable("user_credits", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" })
    .unique(),
  credits: integer("credits").notNull().default(50), // Free users start with 50
  totalCreditsUsed: integer("total_credits_used").notNull().default(0),
  lastResetAt: timestamp("last_reset_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
