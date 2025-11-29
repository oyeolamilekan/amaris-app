import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { polar, checkout, portal } from "@polar-sh/better-auth";
import { polarClient } from "./lib/payments";
import { db } from "@amaris/db";
import * as schema from "@amaris/db/schema/auth";
import { creditPackage } from "@amaris/db/schema/auth";

import { CREDIT_PACKAGES as DEFAULT_PACKAGES } from "./credits";

const dbPackages = await db
  .select()
  .from(creditPackage)
  .catch((e) => {
    console.error("Failed to load credit packages", e);
    return [];
  });
const packages = dbPackages.length > 0 ? dbPackages : DEFAULT_PACKAGES;

export const CREDIT_PACKAGES = packages;
export const auth = betterAuth<BetterAuthOptions>({
  database: drizzleAdapter(db, {
    provider: "pg",

    schema: schema,
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
      },
    },
  },
  trustedOrigins: [process.env.CORS_ORIGIN || ""],
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },
  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      enableCustomerPortal: true,
      use: [
        checkout({
          products: [
            ...packages.map((pkg) => ({
              productId: pkg.polarProductId,
              slug: pkg.id,
            })),
          ],
          successUrl: `${process.env.CORS_ORIGIN}/dashboard?payment=success`,
          authenticatedUsersOnly: true,
        }),
        portal(),
      ],
    }),
  ],
});
