// Migration script to clean up conflicting user data
import { mutation } from "./_generated/server";

export const cleanupConflictingData = mutation({
  args: {},
  handler: async (ctx) => {
    let cleaned = 0;
    
    try {
      // Get all users and check for conflicts
      const allUsers = await ctx.db.query("users").collect();
      
      for (const user of allUsers) {
        const userAny = user as any;
        // If user has extra fields not in auth schema, remove it
        if (userAny.role !== undefined || userAny.isActive !== undefined) {
          await ctx.db.delete(user._id);
          cleaned++;
          console.log(`Cleaned conflicting user: ${user.email}`);
        }
      }
      
      console.log(`Migration complete: cleaned ${cleaned} conflicting users`);
      return { success: true, cleaned };
      
    } catch (error) {
      console.error("Migration failed:", error);
      return { success: false, error: String(error) };
    }
  },
});

export const createAdminUser = mutation({
  args: {},
  handler: async (ctx) => {
    try {
      const adminEmail = "admin@cypherguard.com";
      
      // Check if admin role already exists
      const existingAdmin = await ctx.db
        .query("userRoles")
        .withIndex("by_email", (q) => q.eq("email", adminEmail))
        .first();

      if (existingAdmin) {
        return { 
          success: false, 
          message: "Admin user already exists",
          email: adminEmail 
        };
      }

      // Create admin role record
      await ctx.db.insert("userRoles", {
        email: adminEmail,
        role: "admin",
        isActive: true,
        firstName: "Admin",
        lastName: "User",
      });

      console.log(`Created admin user: ${adminEmail}`);
      return { 
        success: true, 
        message: "Admin user created successfully",
        email: adminEmail,
        note: "Use dev-login page to access admin account"
      };
      
    } catch (error) {
      console.error("Failed to create admin user:", error);
      return { success: false, error: String(error) };
    }
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

    console.log("Database cleaned up successfully");
    return { success: true, message: "Database cleaned up" };
  },
}); 