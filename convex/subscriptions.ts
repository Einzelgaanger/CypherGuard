import { query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

export const subscribeToVisitors = query({
  args: { estateId: v.id("estates") },
  handler: async (ctx, args) => {
    const visits = await ctx.db
      .query("visits")
      .withIndex("by_estate_status", (q) => q.eq("estateId", args.estateId))
      .filter((q) => q.eq(q.field("status"), "checked_in"))
      .order("desc")
      .collect();

    // Fetch related data
    const visitData = await Promise.all(
      visits.map(async (visit) => {
        const guest = await ctx.db.get(visit.guestId);
        const resident = visit.residentId ? await ctx.db.get(visit.residentId) : null;

        return {
          ...visit,
          guest,
          resident,
        };
      })
    );

    return visitData;
  },
});

export const subscribeToInvitations = query({
  args: { residentId: v.id("residents") },
  handler: async (ctx, args) => {
    const invitations = await ctx.db
      .query("invitations")
      .withIndex("by_resident", (q) => q.eq("residentId", args.residentId))
      .order("desc")
      .take(10);

    return invitations.map(invitation => ({
      ...invitation,
      isExpired: invitation.expiresAt < Date.now(),
    }));
  },
});

export const subscribeToEstateActivity = query({
  args: { estateId: v.id("estates") },
  handler: async (ctx, args) => {
    // Get recent visits (last 24 hours)
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    const recentVisits = await ctx.db
      .query("visits")
      .withIndex("by_estate_status", (q) => q.eq("estateId", args.estateId))
      .filter((q) => q.gte(q.field("checkinTime"), oneDayAgo))
      .order("desc")
      .take(20);

    // Get active invitations
    const activeInvitations = await ctx.db
      .query("invitations")
      .filter((q) => 
        q.and(
          q.eq(q.field("isUsed"), false),
          q.gt(q.field("expiresAt"), Date.now())
        )
      )
      .take(10);

    // Count current visitors
    const currentVisitors = await ctx.db
      .query("visits")
      .withIndex("by_estate_status", (q) => q.eq("estateId", args.estateId))
      .filter((q) => q.eq(q.field("status"), "checked_in"))
      .collect();

    return {
      recentVisits: recentVisits.length,
      activeInvitations: activeInvitations.length,
      currentVisitors: currentVisitors.length,
      lastUpdate: Date.now(),
    };
  },
}); 

export const subscribeToAlerts = query({
  args: { estateId: v.id("estates") },
  handler: async (ctx, args) => {
    const alerts = await ctx.db
      .query("alerts")
      .withIndex("by_estate_unread", (q) => q.eq("estateId", args.estateId))
      .order("desc")
      .take(20);

    return alerts;
  },
}); 