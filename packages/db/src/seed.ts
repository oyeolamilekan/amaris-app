import { db } from "./index";
import { creditPackage } from "./schema/auth";

const CREDIT_PACKAGES = [
  {
    id: "credits-10",
    polarProductId: "ad039347-4617-4589-a559-05d7c8695800", // Replace with actual Polar Product ID
    name: "10 Credits",
    credits: 10,
    price: 500, // $5.00 in cents
    currency: "usd",
  },
  {
    id: "credits-50",
    polarProductId: "00000000-0000-0000-0000-000000000002", // Replace with actual Polar Product ID
    name: "50 Credits",
    credits: 50,
    price: 2000, // $20.00 in cents
    currency: "usd",
  },
  {
    id: "credits-100",
    polarProductId: "00000000-0000-0000-0000-000000000003", // Replace with actual Polar Product ID
    name: "100 Credits",
    credits: 100,
    price: 3500, // $35.00 in cents
    currency: "usd",
  },
];

async function seed() {
  console.log("Seeding credit packages...");
  
  for (const pkg of CREDIT_PACKAGES) {
    await db.insert(creditPackage).values(pkg).onConflictDoUpdate({
      target: creditPackage.id,
      set: pkg,
    });
  }

  console.log("Seeding complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
