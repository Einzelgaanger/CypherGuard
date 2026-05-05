// Simple auth functions for the new user role system
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";
import { v } from "convex/values";

// Get current user with role from userRoles table
export const getCurrentUser = query({
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
      firstName: userRole?.firstName,
      lastName: userRole?.lastName,
    };
  },
});

// Create user role after successful signup
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
      throw new Error("Must be authenticated to create role");
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

// Get current resident with simplified approach
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

    // Get resident record - search by email with conditional logic
    const allResidents = await ctx.db.query("residents").collect();
    const resident = allResidents.find(r => 
      r.email === authUser.email || 
      (!r.email && r.name && r.name.toLowerCase().includes(userRole.firstName?.toLowerCase() || ""))
    );

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