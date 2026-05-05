import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate a random token for verification
function generateRandomToken(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const submitRegistrationRequest = mutation({
  args: {
    email: v.string(),
    phone: v.string(),
    role: v.union(v.literal("resident"), v.literal("admin")),
    firstName: v.string(),
    lastName: v.string(),
    nationalId: v.optional(v.string()),
    requestReason: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already has a role (indicating existing registration)
    const existingRole = await ctx.db
      .query("userRoles")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingRole) {
      throw new Error("User with this email already exists");
    }

    // Check for existing pending request
    const existingRequest = await ctx.db
      .query("user_registration_requests")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existingRequest) {
      throw new Error("Registration request already pending approval");
    }

    // Create registration request
    const requestId = await ctx.db.insert("user_registration_requests", {
      email: args.email,
      phone: args.phone,
      role: args.role,
      firstName: args.firstName,
      lastName: args.lastName,
      nationalId: args.nationalId,
      requestReason: args.requestReason,
      status: "pending",
      requestedAt: Date.now(),
    });

    // Log the registration attempt
    await ctx.db.insert("audit_logs", {
      action: "registration_request_submitted",
      entityType: "user_registration_request",
      entityId: requestId,
      details: {
        email: args.email,
        role: args.role,
        requestReason: args.requestReason,
      },
    });

    return {
      success: true,
      message: "Registration request submitted for admin approval",
      requestId,
    };
  },
});

export const verifyEmailForRegistration = mutation({
  args: {
    email: v.string(),
    verificationCode: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify email with temporary OTP system
    // This integrates with the existing OTP system
    const otp = await ctx.db
      .query("otps")
      .withIndex("by_phone", (q) => q.eq("phone", args.email)) // Using phone field for email
      .filter((q) => 
        q.and(
          q.eq(q.field("otp"), args.verificationCode),
          q.eq(q.field("isUsed"), false),
          q.gt(q.field("expiresAt"), Date.now())
        )
      )
      .first();

    if (!otp) {
      throw new Error("Invalid or expired verification code");
    }

    // Mark OTP as used
    await ctx.db.patch(otp._id, { isUsed: true });

    return { success: true, verified: true };
  },
});

export const getUserProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    // Get user's role information
    const userRole = await ctx.db
      .query("userRoles")
      .withIndex("by_email", (q) => q.eq("email", user.email!))
      .first();

    // Get user's resident info if applicable
    let residentInfo = null;
    if (userRole?.role === "resident") {
      residentInfo = await ctx.db
        .query("residents")
        .filter((q) => q.eq(q.field("email"), user.email!))
        .first();
    }

    return {
      ...user,
      role: userRole?.role,
      residentInfo,
    };
  },
});

export const updateUserBasicInfo = mutation({
  args: {
    userId: v.id("users"),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Prepare update object
    const updateData: any = {};
    
    if (args.email) {
      updateData.email = args.email;
    }
    
    if (args.phone) {
      updateData.phone = args.phone;
    }

    await ctx.db.patch(args.userId, updateData);

    // Log basic update in audit logs
    await ctx.db.insert("audit_logs", {
      userId: args.userId,
      action: "user_info_updated",
      entityType: "user",
      entityId: args.userId,
      details: {
        updatedFields: Object.keys(updateData),
      },
    });

    return { success: true };
  },
});

// Get registration requests for admin approval
export const getRegistrationRequests = query({
  args: { 
    status: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")))
  },
  handler: async (ctx, args) => {
    let requests;
    
    if (args.status) {
      requests = await ctx.db
        .query("user_registration_requests")
        .withIndex("by_status", (q) => q.eq("status", args.status as "pending" | "approved" | "rejected"))
        .order("desc")
        .take(50);
    } else {
      requests = await ctx.db
        .query("user_registration_requests")
        .order("desc")
        .take(50);
    }

    return requests.map(request => ({
      ...request,
      requestAge: Date.now() - request.requestedAt,
    }));
  },
}); 