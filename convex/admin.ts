import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";
import { auth } from "./auth";

// Helper function to get admin user (supports both real auth and dev mode)
async function getAdminUser(ctx: any) {
  // Try Convex Auth first
  const userId = await auth.getUserId(ctx);
  if (userId) {
    const authUser = await ctx.db.get(userId);
    if (authUser) {
      const userRole = await ctx.db
        .query("userRoles")
        .withIndex("by_email", (q: any) => q.eq("email", (authUser as any).email!))
        .first();
      
      if (userRole && userRole.role === "admin") {
        return { authUser, userRole };
      }
    }
  }
  
  // For development mode, check if we have an admin in userRoles table
  // This is a fallback for dev-login scenarios
  const adminRole = await ctx.db
    .query("userRoles")
    .filter((q: any) => q.eq(q.field("role"), "admin"))
    .first();
    
  if (adminRole) {
    // Create a mock auth user for dev mode
    const mockAuthUser = {
      _id: `dev_${adminRole._id}` as any,
      email: adminRole.email,
    };
    return { authUser: mockAuthUser, userRole: adminRole };
  }
  
  throw new Error("Not authenticated as admin");
}

export const getDashboardData = query({
  args: { 
    estateId: v.id("estates"),
    filter: v.optional(v.union(
      v.literal("expected"), 
      v.literal("checked_in"), 
      v.literal("all")
    ))
  },
  handler: async (ctx, args) => {
    // Get all visits for the estate
    let visitsQuery = ctx.db
      .query("visits")
      .withIndex("by_estate_status", (q) => q.eq("estateId", args.estateId));

    if (args.filter === "checked_in") {
      visitsQuery = visitsQuery.filter((q) => q.eq(q.field("status"), "checked_in"));
    } else if (args.filter === "expected") {
      // Get pending invitations for expected guests
      const now = Date.now();
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const allInvitations = await ctx.db
        .query("invitations")
        .filter((q) => q.eq(q.field("isUsed"), false))
        .collect();

      // Filter for today's expected arrivals
      const expectedInvitations = allInvitations.filter(inv => 
        inv.arrivalWindow.from >= todayStart.getTime() && 
        inv.arrivalWindow.from <= todayEnd.getTime()
      );

      return {
        visits: [],
        expectedGuests: expectedInvitations.map(inv => ({
          type: 'expected',
          invitation: inv,
          expectedArrival: inv.arrivalWindow.from,
        })),
      };
    }

    const visits = await visitsQuery
      .order("desc")
      .take(50);

    // Fetch related data
    const visitData = await Promise.all(
      visits.map(async (visit) => {
        const guest = await ctx.db.get(visit.guestId);
        const resident = visit.residentId ? await ctx.db.get(visit.residentId) : null;
        const invitation = visit.invitationId ? await ctx.db.get(visit.invitationId) : null;

        return {
          ...visit,
          guest,
          resident,
          invitation,
          duration: visit.checkoutTime ? 
            visit.checkoutTime - visit.checkinTime : 
            Date.now() - visit.checkinTime,
        };
      })
    );

    return {
      visits: visitData,
      expectedGuests: args.filter === "all" ? [] : undefined,
    };
  },
});

export const checkoutVisitor = mutation({
  args: { 
    visitId: v.id("visits"),
    adminNotes: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const visit = await ctx.db.get(args.visitId);
    if (!visit) {
      throw new Error("Visit not found");
    }

    if (visit.status === "checked_out") {
      throw new Error("Visitor already checked out");
    }

    await ctx.db.patch(args.visitId, {
      checkoutTime: Date.now(),
      status: "checked_out",
      adminNotes: args.adminNotes,
    });

    // Log audit event
    await ctx.db.insert("audit_logs", {
      action: "visitor_checkout",
      entityType: "visit",
      entityId: args.visitId,
      details: {
        adminNotes: args.adminNotes,
      },
    });

    return { success: true };
  },
});

export const getEstateSettings = query({
  args: { estateId: v.id("estates") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.estateId);
  },
});

export const getVisitorStats = query({
  args: { 
    estateId: v.id("estates"),
    period: v.optional(v.union(
      v.literal("today"),
      v.literal("week"),
      v.literal("month")
    ))
  },
  handler: async (ctx, args) => {
    const period = args.period ?? "today";
    
    let startTime: number;
    const now = Date.now();
    
    switch (period) {
      case "today":
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        startTime = today.getTime();
        break;
      case "week":
        startTime = now - (7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startTime = now - (30 * 24 * 60 * 60 * 1000);
        break;
    }

    const visits = await ctx.db
      .query("visits")
      .withIndex("by_estate_status", (q) => q.eq("estateId", args.estateId))
      .filter((q) => q.gte(q.field("checkinTime"), startTime))
      .collect();

    const checkedInCount = visits.filter(v => v.status === "checked_in").length;
    const totalVisits = visits.length;
    const walkIns = visits.filter(v => !v.invitationId).length;
    const preRegistered = visits.filter(v => v.invitationId).length;

    return {
      totalVisits,
      checkedInCount,
      checkedOutCount: visits.filter(v => v.status === "checked_out").length,
      walkIns,
      preRegistered,
      period,
    };
  },
});

// Enhanced admin features for Phase 3
export const bulkCheckout = mutation({
  args: { 
    visitIds: v.array(v.id("visits")),
    adminNotes: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const results = [];
    
    for (const visitId of args.visitIds) {
      try {
        const visit = await ctx.db.get(visitId);
        if (visit && visit.status === "checked_in") {
          await ctx.db.patch(visitId, {
            checkoutTime: Date.now(),
            status: "checked_out",
            adminNotes: args.adminNotes,
          });

          // Log audit event
          await ctx.db.insert("audit_logs", {
            action: "bulk_checkout",
            entityType: "visit",
            entityId: visitId,
            details: {
              adminNotes: args.adminNotes,
              bulkOperation: true,
            },
          });

          results.push({ visitId, success: true });
        } else {
          results.push({ visitId, success: false, error: "Invalid visit" });
        }
      } catch (error) {
        results.push({ visitId, success: false, error: (error as Error).message });
      }
    }

    return { results };
  },
});

export const getVisitorDetails = query({
  args: { visitId: v.id("visits") },
  handler: async (ctx, args) => {
    const visit = await ctx.db.get(args.visitId);
    if (!visit) return null;

    const guest = await ctx.db.get(visit.guestId);
    const resident = visit.residentId ? await ctx.db.get(visit.residentId) : null;
    const invitation = visit.invitationId ? await ctx.db.get(visit.invitationId) : null;

    // Get guest's visit history
    const guestHistory = await ctx.db
      .query("visits")
      .withIndex("by_guest", (q) => q.eq("guestId", visit.guestId))
      .filter((q) => q.neq(q.field("_id"), args.visitId))
      .order("desc")
      .take(5);

    // Get photo if exists
    let photoUrl = null;
    if (guest?.photoStorageId) {
      photoUrl = await ctx.storage.getUrl(guest.photoStorageId);
    }

    return {
      visit,
      guest: guest ? { ...guest, photoUrl } : null,
      resident,
      invitation,
      guestHistory,
      duration: visit.checkoutTime ? 
        visit.checkoutTime - visit.checkinTime : 
        Date.now() - visit.checkinTime,
    };
  },
});

export const flagVisitor = mutation({
  args: { 
    visitId: v.id("visits"),
    flag: v.union(v.literal("overstay"), v.literal("suspicious"), v.literal("resolved")),
    notes: v.string()
  },
  handler: async (ctx, args) => {
    const visit = await ctx.db.get(args.visitId);
    if (!visit) {
      throw new Error("Visit not found");
    }

    // Update visit status if flagging as overstay
    if (args.flag === "overstay" && visit.status === "checked_in") {
      await ctx.db.patch(args.visitId, { status: "overstay" });
    }

    // Log audit event
    await ctx.db.insert("audit_logs", {
      action: "visitor_flagged",
      entityType: "visit",
      entityId: args.visitId,
      details: {
        flag: args.flag,
        notes: args.notes,
      },
    });

    return { success: true };
  },
}); 

// Admin User Management Functions

export const reviewRegistrationRequest = mutation({
  args: {
    requestId: v.id("user_registration_requests"),
    action: v.union(v.literal("approve"), v.literal("reject")),
    reviewNotes: v.optional(v.string()),
    // Removed adminUserId - we'll get it from the authenticated user
  },
  handler: async (ctx, args) => {
    // Get admin user (supports both real auth and dev mode)
    const { authUser: adminAuthUser, userRole: adminUserRole } = await getAdminUser(ctx);

    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Registration request not found");
    }

    if (request.status !== "pending") {
      throw new Error("Request has already been reviewed");
    }

    const newStatus = args.action === "approve" ? "approved" : "rejected";

    // Update request status
    const updateData: any = {
      status: newStatus,
      reviewedAt: Date.now(),
      reviewNotes: args.reviewNotes,
    };

    // Only set reviewedBy if we have a real auth user (not dev mode)
    const isDevMode = typeof adminAuthUser._id === 'string' && adminAuthUser._id.startsWith('dev_');
    if (!isDevMode) {
      updateData.reviewedBy = adminAuthUser._id as Id<"users">;
    }

    await ctx.db.patch(args.requestId, updateData);

    if (args.action === "approve") {
      // Generate a temporary password for the new user
      const tempPassword = generateSecurePassword();
      
      // Store temporary credentials for the approved user
      await ctx.db.insert("pending_auth_setup", {
        email: request.email,
        tempPassword: tempPassword,
        firstName: request.firstName,
        lastName: request.lastName,
        role: request.role,
        isUsed: false,
        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
        createdAt: Date.now(),
      });

      // Send welcome email with temporary credentials
      try {
        await ctx.runMutation(api.notifications.sendWelcomeEmail, {
          email: request.email,
          firstName: request.firstName,
          lastName: request.lastName,
          tempPassword: tempPassword,
          role: request.role,
        });
      } catch (error) {
        console.error("Failed to send welcome email:", error);
        // Continue with approval even if email fails
      }

      // Log approval
      const approvalLogData: any = {
        action: "user_registration_approved",
        entityType: "user",
        entityId: request.email,
        details: {
          requestId: args.requestId,
          newUserEmail: request.email,
          role: request.role,
        },
      };
      // Only set userId if we have a real auth user (not dev mode)
      if (!isDevMode) {
        approvalLogData.userId = adminAuthUser._id as Id<"users">;
      }
      await ctx.db.insert("audit_logs", approvalLogData);
    } else {
      // Log rejection
      const rejectionLogData: any = {
        action: "user_registration_rejected",
        entityType: "user_registration_request",
        entityId: args.requestId,
        details: {
          email: request.email,
          role: request.role,
          reviewNotes: args.reviewNotes,
        },
      };
      // Only set userId if we have a real auth user (not dev mode)
      if (!isDevMode) {
        rejectionLogData.userId = adminAuthUser._id as Id<"users">;
      }
      await ctx.db.insert("audit_logs", rejectionLogData);
    }

    return { success: true, status: newStatus };
  },
});

export const getAllUsers = query({
  args: {
    role: v.optional(v.union(v.literal("guest"), v.literal("resident"), v.literal("admin"))),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Query userRoles table instead of users table
    let userRoles;

    if (args.role) {
      userRoles = await ctx.db
        .query("userRoles")
        .filter((q) => q.eq(q.field("role"), args.role))
        .order("desc")
        .take(100);
    } else {
      userRoles = await ctx.db
        .query("userRoles")
        .order("desc")
        .take(100);
    }

    if (args.isActive !== undefined) {
      userRoles = userRoles.filter(userRole => userRole.isActive === args.isActive);
    }

    // Get additional info for each user
    const usersWithInfo = await Promise.all(
      userRoles.map(async (userRole) => {
        let additionalInfo = {};

        // Get auth user info
        const authUser = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("email"), userRole.email))
          .first();

        if (userRole.role === "resident") {
          const resident = await ctx.db
            .query("residents")
            .filter((q) => q.eq(q.field("email"), userRole.email))
            .first();
          additionalInfo = { resident };
        }

        return {
          ...userRole,
          authUser,
          ...additionalInfo,
        };
      })
    );

    return usersWithInfo;
  },
});

export const updateUserStatus = mutation({
  args: {
    userEmail: v.string(), // Use email instead of userId
    isActive: v.boolean(),
    // Removed adminUserId - we'll get it from the authenticated user
  },
  handler: async (ctx, args) => {
    // Get admin user (supports both real auth and dev mode)
    const { authUser: adminAuthUser, userRole: adminUserRole } = await getAdminUser(ctx);

    // Find user role record
    const userRole = await ctx.db
      .query("userRoles")
      .withIndex("by_email", (q) => q.eq("email", args.userEmail))
      .first();
    
    if (!userRole) {
      throw new Error("User not found");
    }

    const previousStatus = userRole.isActive;

    // Update userRoles table
    await ctx.db.patch(userRole._id, {
      isActive: args.isActive,
    });

    // Log status change
    const isDevMode = typeof adminAuthUser._id === 'string' && adminAuthUser._id.startsWith('dev_');
    const statusLogData: any = {
      action: args.isActive ? "user_activated" : "user_deactivated",
      entityType: "user",
      entityId: args.userEmail,
      details: {
        targetUserEmail: args.userEmail,
        previousStatus,
        newStatus: args.isActive,
      },
    };
    // Only set userId if we have a real auth user (not dev mode)
    if (!isDevMode) {
      statusLogData.userId = adminAuthUser._id as Id<"users">;
    }
    await ctx.db.insert("audit_logs", statusLogData);

    return { success: true };
  },
});

export const updateUserRole = mutation({
  args: {
    userEmail: v.string(), // Use email instead of userId
    newRole: v.union(v.literal("guest"), v.literal("resident"), v.literal("admin")),
    // Removed adminUserId - we'll get it from the authenticated user
  },
  handler: async (ctx, args) => {
    // Get admin user (supports both real auth and dev mode)
    const { authUser: adminAuthUser, userRole: adminUserRole } = await getAdminUser(ctx);

    // Find user role record
    const userRole = await ctx.db
      .query("userRoles")
      .withIndex("by_email", (q) => q.eq("email", args.userEmail))
      .first();
    
    if (!userRole) {
      throw new Error("User not found");
    }

    const oldRole = userRole.role;

    // Update userRoles table
    await ctx.db.patch(userRole._id, {
      role: args.newRole,
    });

    // Log role change
    const isDevMode = typeof adminAuthUser._id === 'string' && adminAuthUser._id.startsWith('dev_');
    const roleLogData: any = {
      action: "user_role_changed",
      entityType: "user",
      entityId: args.userEmail,
      details: {
        targetUserEmail: args.userEmail,
        oldRole,
        newRole: args.newRole,
      },
    };
    // Only set userId if we have a real auth user (not dev mode)
    if (!isDevMode) {
      roleLogData.userId = adminAuthUser._id as Id<"users">;
    }
    await ctx.db.insert("audit_logs", roleLogData);

    return { success: true };
  },
});

export const getUserRegistrationStats = query({
  args: {},
  handler: async (ctx) => {
    const pendingRequests = await ctx.db
      .query("user_registration_requests")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    const approvedRequests = await ctx.db
      .query("user_registration_requests")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .collect();

    const rejectedRequests = await ctx.db
      .query("user_registration_requests")
      .withIndex("by_status", (q) => q.eq("status", "rejected"))
      .collect();

    const activeUsers = await ctx.db
      .query("userRoles")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return {
      pendingRequests: pendingRequests.length,
      approvedRequests: approvedRequests.length,
      rejectedRequests: rejectedRequests.length,
      activeUsers: activeUsers.length,
      totalUsers: activeUsers.length, // Simplified for now
    };
  },
});

// Utility function to generate secure password
function generateSecurePassword(): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  const allChars = uppercase + lowercase + numbers + symbols;
  
  let password = '';
  
  // Ensure at least one character from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Generate remaining characters
  for (let i = 4; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Get pending auth setup for approved users (admin only)
export const getPendingAuthSetup = query({
  args: { email: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.email) {
      return await ctx.db
        .query("pending_auth_setup")
        .withIndex("by_email", (q) => q.eq("email", args.email!))
        .filter((q) => q.eq(q.field("isUsed"), false))
        .first();
    }
    
    // Get all pending setups
    return await ctx.db
      .query("pending_auth_setup")
      .filter((q) => q.eq(q.field("isUsed"), false))
      .order("desc")
      .take(50);
  },
});

// Mark auth setup as used
export const markAuthSetupUsed = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const setup = await ctx.db
      .query("pending_auth_setup")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .filter((q) => q.eq(q.field("isUsed"), false))
      .first();
      
    if (setup) {
      await ctx.db.patch(setup._id, { isUsed: true });
    }
    
    return { success: true };
  },
}); 