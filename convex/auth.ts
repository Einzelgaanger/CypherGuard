import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password({
      profile: (params) => ({
        email: params.email as string,
        name: params.name as string,
      }),
    }),
  ],
});

// Get current user with role information
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    // Find user's role from userRoles table
    const userRole = await ctx.db
      .query("userRoles")
      .withIndex("by_email", (q) => q.eq("email", user.email!))
      .first();
    
    return {
      id: userId,
      email: user.email,
      role: userRole?.role || "guest",
    };
  },
});

// Create user role after auth account creation
export const createUserRole = mutation({
  args: { 
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to create profile");
    }

    const authUser = await ctx.db.get(userId);
    if (!authUser || authUser.email !== args.email) {
      throw new Error("Email mismatch");
    }

    // Check if role already exists
    const existingRole = await ctx.db
      .query("userRoles")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingRole) {
      return existingRole._id;
    }

    // Create new user role
    const roleId = await ctx.db.insert("userRoles", {
      email: args.email,
      role: args.role as "guest" | "resident" | "admin",
      isActive: true,
      firstName: args.firstName,
      lastName: args.lastName,
      });

    // If resident, create resident record
    if (args.role === "resident") {
      const estate = await ctx.db.query("estates").first();
      if (estate) {
        await ctx.db.insert("residents", {
        email: args.email,
          estateId: estate._id,
          unitNumber: "TBD",
          name: `${args.firstName} ${args.lastName}`,
          isVerified: false,
        });
      }
    }

    return roleId;
  },
});

// Get current resident with full profile data
export const getCurrentResident = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const authUser = await ctx.db.get(userId);
    if (!authUser) return null;

    // Find user role
    const userRole = await ctx.db
      .query("userRoles")
      .withIndex("by_email", (q) => q.eq("email", authUser.email!))
      .first();

    if (!userRole || userRole.role !== "resident") return null;

    // Get resident record
    const resident = await ctx.db
      .query("residents")
      .filter((q) => q.eq(q.field("email"), authUser.email!))
      .first();

    if (!resident) return null;

    // Get estate information
    const estate = await ctx.db.get(resident.estateId);

    return { 
      ...resident, 
      userRole,
      estate,
      authUserId: userId
    };
  },
});

// DISABLED: Legacy function - use simpleAuth.createUserRole instead
// export const createUserRecord = mutation({
//   args: { 
//     email: v.string(),
//     phone: v.optional(v.string()),
//     role: v.union(v.literal("admin"), v.literal("resident"), v.literal("guest")),
//   },
//   handler: async (ctx, args) => {
//     // Check if current user is admin
//     const userId = await auth.getUserId(ctx);
//     if (!userId) {
//       throw new Error("Unauthorized: Must be logged in");
//     }

//     const user = await ctx.db.get(userId);
//     if (!user) {
//       throw new Error("Unauthorized: User not found");
//     }

//     const userRecord = await ctx.db
//       .query("users")
//       .withIndex("by_email", (q) => q.eq("email", user.email!))
//       .first();

//     if (!userRecord || userRecord.role !== "admin") {
//       throw new Error("Unauthorized: Only admins can create user records");
//     }

//     const existing = await ctx.db
//       .query("users")
//       .withIndex("by_email", (q) => q.eq("email", args.email))
//       .first();

//     if (existing) {
//       await ctx.db.patch(existing._id, {
//         phone: args.phone || existing.phone,
//         role: args.role,
//       });
//       return existing._id;
//     } else {
//       return await ctx.db.insert("users", {
//         email: args.email,
//         phone: args.phone || "",
//         role: args.role,
//         isActive: true,
//       });
//     }
//   },
// });

// DISABLED: Legacy functions - use simpleAuth.ts and admin.ts equivalents instead

// // Check if user has required role
// export const hasRole = query({
//   args: { 
//     requiredRole: v.union(v.literal("admin"), v.literal("resident"), v.literal("guest"))
//   },
//   handler: async (ctx, args): Promise<boolean> => {
//     const userId = await auth.getUserId(ctx);
//     if (!userId) return false;

//     const user = await ctx.db.get(userId);
//     if (!user) return false;

//     // Find user's role from users table
//     const userRecord = await ctx.db
//       .query("users")
//       .withIndex("by_email", (q) => q.eq("email", user.email!))
//       .first();
    
//     if (!userRecord) return false;
    
//     const roleHierarchy: Record<string, number> = {
//       admin: 3,
//       resident: 2, 
//       guest: 1,
//     };
    
//     return roleHierarchy[userRecord.role] >= roleHierarchy[args.requiredRole];
//   },
// });

// // Get all users (admin only)
// export const getAllUsers = query({
//   args: {},
//   handler: async (ctx) => {
//     const userId = await auth.getUserId(ctx);
//     if (!userId) {
//       throw new Error("Unauthorized: Must be logged in");
//     }

//     const user = await ctx.db.get(userId);
//     if (!user) {
//       throw new Error("Unauthorized: User not found");
//     }

//     const userRecord = await ctx.db
//       .query("users")
//       .withIndex("by_email", (q) => q.eq("email", user.email!))
//       .first();

//     if (!userRecord || userRecord.role !== "admin") {
//       throw new Error("Unauthorized: Only admins can view user list");
//     }

//     return await ctx.db.query("users").collect();
//   },
// });

// // Update user role (admin only)
// export const updateUserRole = mutation({
//   args: {
//     userId: v.id("users"),
//     role: v.union(v.literal("admin"), v.literal("resident"), v.literal("guest")),
//   },
//   handler: async (ctx, args) => {
//     const userId = await auth.getUserId(ctx);
//     if (!userId) {
//       throw new Error("Unauthorized: Must be logged in");
//     }

//     const user = await ctx.db.get(userId);
//     if (!user) {
//       throw new Error("Unauthorized: User not found");
//     }

//     const userRecord = await ctx.db
//       .query("users")
//       .withIndex("by_email", (q) => q.eq("email", user.email!))
//       .first();

//     if (!userRecord || userRecord.role !== "admin") {
//       throw new Error("Unauthorized: Only admins can update user roles");
//     }

//     await ctx.db.patch(args.userId, { role: args.role });
//     return { success: true };
//   },
// });

// // Deactivate user (admin only)
// export const deactivateUser = mutation({
//   args: { userId: v.id("users") },
//   handler: async (ctx, args) => {
//     const userId = await auth.getUserId(ctx);
//     if (!userId) {
//       throw new Error("Unauthorized: Must be logged in");
//     }

//     const user = await ctx.db.get(userId);
//     if (!user) {
//       throw new Error("Unauthorized: User not found");
//     }

//     const userRecord = await ctx.db
//       .query("users")
//       .withIndex("by_email", (q) => q.eq("email", user.email!))
//       .first();

//     if (!userRecord || userRecord.role !== "admin") {
//       throw new Error("Unauthorized: Only admins can deactivate users");
//     }

//     await ctx.db.patch(args.userId, { isActive: false });
//     return { success: true };
//   },
// });

// // Development helper - check if user exists in database for testing
// export const checkUserExists = query({
//   args: { email: v.string() },
//   handler: async (ctx, args) => {
//     const user = await ctx.db
//       .query("users")
//       .withIndex("by_email", (q) => q.eq("email", args.email))
//       .first();
    
//     return !!user;
//   },
// }); 