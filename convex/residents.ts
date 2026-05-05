import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { auth } from "./auth";

export const createInvitation = mutation({
  args: {
    guestName: v.string(),
    guestIdNumber: v.string(),
    guestPhone: v.optional(v.string()),
    vehicleRegistration: v.optional(v.string()),
    arrivalWindow: v.object({
      from: v.number(),
      to: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    // Get current authenticated user
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const authUser = await ctx.db.get(userId);
    if (!authUser) {
      throw new Error("User not found");
    }

    // Find user role record by email
    const userRole = await ctx.db
      .query("userRoles")
      .withIndex("by_email", (q) => q.eq("email", authUser.email!))
      .first();

    if (!userRole || userRole.role !== "resident") {
      throw new Error("Not authenticated as resident");
    }

    // Get resident record
    const resident = await ctx.db
      .query("residents")
      .filter((q) => q.eq(q.field("email"), authUser.email!))
      .first();

    if (!resident) {
      throw new Error("Resident record not found");
    }

    // Generate unique invitation token
    const token = generateRandomToken(12);

    // Check if guest already has pending invitation
    const existingInvitation = await ctx.db
      .query("invitations")
      .withIndex("by_resident", (q) => q.eq("residentId", resident._id))
      .filter((q) => 
        q.and(
          q.eq(q.field("guestIdNumber"), args.guestIdNumber),
          q.eq(q.field("isUsed"), false),
          q.gt(q.field("expiresAt"), Date.now())
        )
      )
      .first();

    if (existingInvitation) {
      throw new Error("Active invitation already exists for this guest");
    }

    const invitationId = await ctx.db.insert("invitations", {
      residentId: resident._id,
      guestName: args.guestName,
      guestIdNumber: args.guestIdNumber,
      guestPhone: args.guestPhone,
      vehicleRegistration: args.vehicleRegistration,
      token,
      expiresAt: args.arrivalWindow.to,
      isUsed: false,
      arrivalWindow: args.arrivalWindow,
    });

    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: userId, // Use the authenticated user ID
      action: "invitation_created",
      entityType: "invitation",
      entityId: invitationId,
      details: {
        guestName: args.guestName,
        guestIdNumber: args.guestIdNumber,
        residentUnit: resident.unitNumber,
      },
    });

    const invitation = await ctx.db.get(invitationId);
    
    // TODO: Send invitation via SMS/email in Phase 3
    
    return {
      success: true,
      invitation,
      invitationLink: `http://localhost:3000/invitation/${token}`,
    };
  },
});

export const getMyInvitations = query({
  args: {},
  handler: async (ctx) => {
    // Get current authenticated user
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return [];
    }

    const authUser = await ctx.db.get(userId);
    if (!authUser) {
      return [];
    }

    // Find user role record by email
    const userRole = await ctx.db
      .query("userRoles")
      .withIndex("by_email", (q) => q.eq("email", authUser.email!))
      .first();

    if (!userRole || userRole.role !== "resident") {
      return [];
    }

    // Get resident record
    const resident = await ctx.db
      .query("residents")
      .filter((q) => q.eq(q.field("email"), authUser.email!))
      .first();

    if (!resident) {
      return [];
    }

    const invitations = await ctx.db
      .query("invitations")
      .withIndex("by_resident", (q) => q.eq("residentId", resident._id))
      .order("desc")
      .take(20);

    return invitations.map((invitation) => ({
      ...invitation,
      isExpired: invitation.expiresAt < Date.now(),
      invitationLink: `http://localhost:3000/invitation/${invitation.token}`,
    }));
  },
});

export const deleteInvitation = mutation({
  args: { invitationId: v.id("invitations") },
  handler: async (ctx, args) => {
    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) {
      throw new Error("Invitation not found");
    }

    if (invitation.isUsed) {
      throw new Error("Cannot delete used invitation");
    }

    await ctx.db.delete(args.invitationId);

    // Log audit event
    await ctx.db.insert("audit_logs", {
      action: "invitation_deleted",
      entityType: "invitation",
      entityId: args.invitationId,
      details: {
        guestName: invitation.guestName,
        guestIdNumber: invitation.guestIdNumber,
      },
    });

    return { success: true };
  },
});

export const getResidentProfile = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.userId) return null;

    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    // Find user role record by email
    const userRole = await ctx.db
      .query("userRoles")
      .withIndex("by_email", (q) => q.eq("email", user.email!))
      .first();

    if (!userRole || userRole.role !== "resident") return null;

    const resident = await ctx.db
      .query("residents")
      .filter((q) => q.eq(q.field("email"), user.email!))
      .first();

    if (!resident) return null;

    const estate = await ctx.db.get(resident.estateId);

    return {
      ...resident,
      user,
      estate,
    };
  },
});

// Utility function to generate random tokens
function generateRandomToken(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
} 