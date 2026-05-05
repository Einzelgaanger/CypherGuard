import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  // Auth tables required by Convex Auth
  ...authTables,

  // Simple role tracking for authenticated users
  userRoles: defineTable({
    email: v.string(),
    role: v.union(v.literal("guest"), v.literal("resident"), v.literal("admin")),
    isActive: v.boolean(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
  }).index("by_email", ["email"]),

  residents: defineTable({
    email: v.optional(v.string()), // Use email as simple reference 
    userId: v.optional(v.string()), // Legacy field for existing data
    estateId: v.id("estates"),
    unitNumber: v.string(),
    name: v.string(),
    isVerified: v.boolean(),
  }).index("by_estate", ["estateId"]),

  guests: defineTable({
    name: v.string(),
    idNumber: v.string(),
    vehicleRegistration: v.optional(v.string()),
    photoStorageId: v.optional(v.id("_storage")),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
  }).index("by_id_number", ["idNumber"]),

  invitations: defineTable({
    residentId: v.id("residents"),
    guestName: v.string(),
    guestIdNumber: v.string(),
    guestPhone: v.optional(v.string()),
    vehicleRegistration: v.optional(v.string()),
    token: v.string(),
    expiresAt: v.number(),
    isUsed: v.boolean(),
    arrivalWindow: v.object({
      from: v.number(),
      to: v.number(),
    }),
  }).index("by_token", ["token"])
    .index("by_resident", ["residentId"])
    .index("by_expiry", ["expiresAt"]),

  visits: defineTable({
    guestId: v.id("guests"),
    residentId: v.optional(v.id("residents")),
    invitationId: v.optional(v.id("invitations")),
    estateId: v.id("estates"),
    checkinTime: v.number(),
    checkoutTime: v.optional(v.number()),
    purpose: v.string(),
    status: v.union(v.literal("checked_in"), v.literal("checked_out"), v.literal("overstay")),
    adminNotes: v.optional(v.string()),
    checkedInBy: v.optional(v.id("users")),
  }).index("by_estate_status", ["estateId", "status"])
    .index("by_guest", ["guestId"])
    .index("by_checkin_time", ["checkinTime"]),

  estates: defineTable({
    name: v.string(),
    address: v.string(),
    settings: v.object({
      overstayThresholdHours: v.number(),
      requirePhotoUpload: v.boolean(),
      allowWalkIns: v.boolean(),
    }),
  }),

  // Temporary OTP storage
  otps: defineTable({
    phone: v.string(),
    otp: v.string(),
    expiresAt: v.number(),
    isUsed: v.boolean(),
    type: v.union(v.literal("login"), v.literal("verification")),
  }).index("by_phone", ["phone"])
    .index("by_expiry", ["expiresAt"]),

  // User registration requests for admin approval (minimal implementation)
  user_registration_requests: defineTable({
    email: v.string(),
    phone: v.string(),
    role: v.union(v.literal("resident"), v.literal("admin")),
    firstName: v.string(),
    lastName: v.string(),
    nationalId: v.optional(v.string()),
    requestReason: v.string(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    requestedAt: v.number(),
    reviewedAt: v.optional(v.number()),
    reviewedBy: v.optional(v.id("users")),
    reviewNotes: v.optional(v.string()),
  }).index("by_status", ["status"])
    .index("by_email", ["email"]),

  audit_logs: defineTable({
    userId: v.optional(v.id("users")),
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    details: v.any(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  }).index("by_user", ["userId"])
    .index("by_entity", ["entityType", "entityId"])
    .index("by_action", ["action"]),

  // Notification logs for tracking SMS/email delivery
  notification_logs: defineTable({
    type: v.union(v.literal("sms"), v.literal("email")),
    recipient: v.string(),
    message: v.string(),
    status: v.union(v.literal("sent"), v.literal("failed")),
    externalId: v.optional(v.string()),
    error: v.optional(v.string()),
    notificationType: v.string(),
    timestamp: v.number(),
  }).index("by_recipient", ["recipient"])
    .index("by_timestamp", ["timestamp"]),

  // Alerts for overstay and security incidents
  alerts: defineTable({
    type: v.union(v.literal("overstay"), v.literal("security"), v.literal("system")),
    visitId: v.optional(v.id("visits")),
    estateId: v.id("estates"),
    message: v.string(),
    isRead: v.boolean(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    createdAt: v.number(),
    readAt: v.optional(v.number()),
  }).index("by_estate_unread", ["estateId", "isRead"])
    .index("by_created", ["createdAt"]),

  // Pending authentication setup for approved users
  pending_auth_setup: defineTable({
    email: v.string(),
    tempPassword: v.string(),
    firstName: v.optional(v.string()), // Made optional for existing data
    lastName: v.optional(v.string()),  // Made optional for existing data
    role: v.optional(v.string()),      // Made optional for existing data
    userId: v.optional(v.string()),    // Legacy field for existing data
    isUsed: v.boolean(),
    expiresAt: v.number(),
    createdAt: v.number(),
  }).index("by_email", ["email"])
    .index("by_expiry", ["expiresAt"]),
}); 