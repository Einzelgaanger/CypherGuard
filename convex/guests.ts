import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

export const registerGuest = mutation({
  args: {
    name: v.string(),
    idNumber: v.string(),
    vehicleRegistration: v.optional(v.string()),
    purpose: v.string(),
    hostInfo: v.string(),
    photoStorageId: v.optional(v.id("_storage")),
    invitationToken: v.optional(v.string()),
    estateId: v.id("estates"),
  },
  handler: async (ctx, args) => {
    let invitation = null;
    let resident = null;

    // Validate invitation if provided
    if (args.invitationToken) {
      invitation = await ctx.db
        .query("invitations")
        .withIndex("by_token", (q) => q.eq("token", args.invitationToken!))
        .filter((q) => 
          q.and(
            q.eq(q.field("isUsed"), false),
            q.gt(q.field("expiresAt"), Date.now())
          )
        )
        .first();

      if (!invitation) {
        throw new Error("Invalid or expired invitation");
      }

      // Get resident info
      resident = await ctx.db.get(invitation.residentId);
    }

    // Create or update guest record
    let guest = await ctx.db
      .query("guests")
      .withIndex("by_id_number", (q) => q.eq("idNumber", args.idNumber))
      .first();

    if (guest) {
      // Update existing guest
      await ctx.db.patch(guest._id, {
        name: args.name,
        vehicleRegistration: args.vehicleRegistration,
        photoStorageId: args.photoStorageId,
      });
    } else {
      // Create new guest
      const guestId = await ctx.db.insert("guests", {
        name: args.name,
        idNumber: args.idNumber,
        vehicleRegistration: args.vehicleRegistration,
        photoStorageId: args.photoStorageId,
      });
      guest = await ctx.db.get(guestId);
    }

    // Create visit record
    const visitId = await ctx.db.insert("visits", {
      guestId: guest!._id,
      residentId: resident?._id,
      invitationId: invitation?._id,
      estateId: args.estateId,
      checkinTime: Date.now(),
      purpose: args.purpose,
      status: "checked_in",
    });

    // Mark invitation as used if provided
    if (invitation) {
      await ctx.db.patch(invitation._id, { isUsed: true });
    }

    // Log audit event
    await ctx.db.insert("audit_logs", {
      action: "guest_checkin",
      entityType: "visit",
      entityId: visitId,
      details: {
        guestName: args.name,
        idNumber: args.idNumber,
        hasInvitation: !!invitation,
        residentUnit: resident?.unitNumber,
      },
    });

    const visit = await ctx.db.get(visitId);
    
    return {
      success: true,
      visit: visit,
      guest: guest,
      digitalPass: {
        visitId,
        guestName: args.name,
        checkinTime: visit!.checkinTime,
        purpose: args.purpose,
        hostInfo: args.hostInfo,
        qrCode: `VISIT_${visitId}_${Date.now()}`,
      },
    };
  },
});

export const uploadGuestPhoto = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const validateInvitation = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    // Find invitation by token
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!invitation) {
      return { valid: false, error: "Invitation not found" };
    }

    // Get resident info
    const resident = await ctx.db.get(invitation.residentId);
    
    return {
      valid: true,
      ...invitation,
      resident: resident ? {
        name: resident.name,
        unitNumber: resident.unitNumber,
      } : null,
      isExpired: invitation.expiresAt < Date.now(),
    };
  },
});

export const getVisitByToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    // Parse token to extract visit ID
    const parts = args.token.split('_');
    if (parts.length < 2 || parts[0] !== 'VISIT') {
      return null;
    }

    const visitId = parts[1] as Id<"visits">;
    const visit = await ctx.db.get(visitId);
    
    if (!visit) return null;

    const guest = await ctx.db.get(visit.guestId);
    
    return {
      visit,
      guest,
    };
  },
}); 