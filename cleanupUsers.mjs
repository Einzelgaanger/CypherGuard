#!/usr/bin/env node

// Simple script to clean up conflicting user data
import { ConvexHttpClient } from "convex/browser";

const client = new ConvexHttpClient(process.env.CONVEX_URL || "https://rugged-owl-739.convex.cloud");

async function cleanupUsers() {
  try {
    console.log("🧹 Starting user cleanup...");
    
    // This will need to be a mutation we create
    const result = await client.mutation("migration:cleanupConflictingData", {});
    
    console.log("✅ Cleanup complete:", result);
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
    console.log("\n📝 Manual steps:");
    console.log("1. Open Convex Dashboard");
    console.log("2. Go to Data → users table"); 
    console.log("3. Delete any records with 'role' or 'isActive' fields");
  }
}

cleanupUsers(); 