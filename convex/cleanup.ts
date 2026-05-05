// Cleanup script to reset database for auth system
import { mutation } from "./_generated/server";
import { api } from "./_generated/api";

export const cleanupConflictingUsers = mutation({
  args: {},
  handler: async (ctx) => {
    // Find and remove users with extra fields that conflict with auth schema
    const allUsers = await ctx.db.query("users").collect();
    let cleanedCount = 0;
    
    for (const user of allUsers) {
      // Check if user has non-auth fields (role, isActive)
      const userRecord = user as any;
      if (userRecord.role || userRecord.isActive !== undefined) {
        await ctx.db.delete(user._id);
        cleanedCount++;
        console.log(`Removed conflicting user: ${user.email}`);
      }
    }

    console.log(`Cleaned up ${cleanedCount} conflicting user records`);
    return { success: true, message: `Removed ${cleanedCount} conflicting users` };
  },
});

export const cleanupDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    // Remove all pending auth setups
    const pendingSetups = await ctx.db.query("pending_auth_setup").collect();
    for (const setup of pendingSetups) {
      await ctx.db.delete(setup._id);
    }

    // Remove all residents
    const residents = await ctx.db.query("residents").collect();
    for (const resident of residents) {
      await ctx.db.delete(resident._id);
    }

    console.log("Database cleaned up successfully");
    return { success: true, message: "Database cleaned up" };
  },
});

export const resetForAuth = mutation({
  args: {},
  handler: async (ctx) => {
    // Clean up and prepare for auth system
    await ctx.runMutation(api.cleanup.cleanupDatabase);

    console.log("Database reset for auth system");
    return { success: true, message: "Ready for auth system" };
  },
}); 