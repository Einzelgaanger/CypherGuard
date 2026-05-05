import { query, internalMutation } from "./_generated/server";
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const checkOverstays = internalMutation({
  handler: async (ctx) => {
    // Get all estates
    const estates = await ctx.db.query("estates").collect();

    for (const estate of estates) {
      const thresholdMs = estate.settings.overstayThresholdHours * 60 * 60 * 1000;
      const cutoffTime = Date.now() - thresholdMs;

      // Find visits that have exceeded threshold
      const overstayVisits = await ctx.db
        .query("visits")
        .withIndex("by_estate_status", (q) => 
          q.eq("estateId", estate._id).eq("status", "checked_in")
        )
        .filter((q) => q.lt(q.field("checkinTime"), cutoffTime))
        .collect();

      // Update status and send alerts
      for (const visit of overstayVisits) {
        await ctx.db.patch(visit._id, { status: "overstay" });

        // Log audit event
        await ctx.db.insert("audit_logs", {
          action: "overstay_detected",
          entityType: "visit",
          entityId: visit._id,
          details: {
            duration: Date.now() - visit.checkinTime,
            threshold: thresholdMs,
          },
        });

        // Create alert
        await ctx.db.insert("alerts", {
          type: "overstay",
          visitId: visit._id,
          estateId: estate._id,
          message: "Guest has overstayed the allowed duration",
          isRead: false,
          priority: "high",
          createdAt: Date.now(),
        });
      }
    }

    return { processed: estates.length };
  },
});

export const getActiveAlerts = query({
  args: { estateId: v.id("estates") },
  handler: async (ctx, args) => {
    const alerts = await ctx.db
      .query("alerts")
      .filter((q) => 
        q.and(
          q.eq(q.field("estateId"), args.estateId),
          q.eq(q.field("isRead"), false)
        )
      )
      .order("desc")
      .take(20);

    // Fetch related visit data
    const alertsWithData = await Promise.all(
      alerts.map(async (alert) => {
        if (alert.visitId) {
          const visit = await ctx.db.get(alert.visitId);
          const guest = visit ? await ctx.db.get(visit.guestId) : null;
          return { ...alert, visit, guest };
        }
        return alert;
      })
    );

    return alertsWithData;
  },
});

export const markAlertRead = internalMutation({
  args: { alertId: v.id("alerts") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.alertId, { 
      isRead: true,
      readAt: Date.now(),
    });
  },
});

// Schedule the overstay check to run every 15 minutes
const crons = cronJobs();
crons.interval(
  "check overstays",
  { minutes: 15 },
  internal.monitoring.checkOverstays
);

export default crons; 