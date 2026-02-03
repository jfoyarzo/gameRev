import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "../lib/db/schema";
import { eq } from "drizzle-orm";

// Load environment variables manually since this runs outside Next.js
dotenv.config({ path: ".env.local" });

async function main() {
  console.log("🌱 Seeding database...");

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  // Create standalone connection for seeding
  const connection = postgres(process.env.DATABASE_URL);
  const db = drizzle(connection, { schema: { users } });

  try {
    const TEST_USER_EMAIL = "test@example.com";

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: (usersTable, { eq }) => eq(usersTable.email, TEST_USER_EMAIL),
    });

    if (existingUser) {
      console.log("Found existing user, updating...");
      await db.update(users)
        .set({
          username: "TestUser",
          avatar_url: "https://github.com/shadcn.png",
          emailVerified: new Date(),
        })
        .where(eq(users.email, TEST_USER_EMAIL));
    } else {
      console.log("Creating new test user...");
      await db.insert(users).values({
        username: "TestUser",
        email: TEST_USER_EMAIL,
        avatar_url: "https://github.com/shadcn.png",
        emailVerified: new Date(),
      });
    }

    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    // Close the connection to allow script to exit
    await connection.end();
    process.exit(0);
  }
}

main();
