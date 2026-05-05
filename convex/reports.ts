import { query, action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";

export const generateVisitorReport = query({
  args: {
    estateId: v.id("estates"),
    dateRange: v.object({
      from: v.number(),
      to: v.number(),
    }),
    format: v.union(v.literal("summary"), v.literal("detailed")),
    filters: v.optional(v.object({
      purpose: v.optional(v.string()),
      status: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // Get visits in date range
    let visits = await ctx.db
      .query("visits")
      .withIndex("by_estate_status", (q) => q.eq("estateId", args.estateId))
      .filter((q) => 
        q.and(
          q.gte(q.field("checkinTime"), args.dateRange.from),
          q.lte(q.field("checkinTime"), args.dateRange.to)
        )
      )
      .collect();

    // Apply filters
    if (args.filters?.purpose) {
      visits = visits.filter(v => v.purpose === args.filters!.purpose);
    }
    if (args.filters?.status) {
      visits = visits.filter(v => v.status === args.filters!.status);
    }

    // Fetch related data for detailed report
    const visitData = await Promise.all(
      visits.map(async (visit) => {
        const guest = await ctx.db.get(visit.guestId);
        const resident = visit.residentId ? await ctx.db.get(visit.residentId) : null;
        
        return {
          ...visit,
          guest,
          resident,
          duration: visit.checkoutTime ? 
            visit.checkoutTime - visit.checkinTime : 
            Date.now() - visit.checkinTime,
        };
      })
    );

    // Generate summary statistics
    const summary = {
      totalVisits: visits.length,
      checkedInCount: visits.filter((v: any) => v.status === "checked_in").length,
      checkedOutCount: visits.filter((v: any) => v.status === "checked_out").length,
      overstayCount: visits.filter((v: any) => v.status === "overstay").length,
      averageDuration: visitData.length > 0 ? visitData.reduce((acc: number, v: any) => acc + v.duration, 0) / visitData.length : 0,
      byPurpose: {
        business: visits.filter((v: any) => v.purpose === "business").length,
        personal: visits.filter((v: any) => v.purpose === "personal").length,
        delivery: visits.filter((v: any) => v.purpose === "delivery").length,
        maintenance: visits.filter((v: any) => v.purpose === "maintenance").length,
      },
      peakHours: calculatePeakHours(visits),
      uniqueGuests: new Set(visits.map((v: any) => v.guestId)).size,
    };

    if (args.format === "summary") {
      return { summary, visits: [] };
    }

    return { summary, visits: visitData };
  },
});

export const exportReportCSV = action({
  args: {
    estateId: v.id("estates"),
    dateRange: v.object({
      from: v.number(),
      to: v.number(),
    }),
  },
  handler: async (ctx, args): Promise<{
    content: string;
    filename: string;
    summary: any;
  }> => {
    const reportData: any = await ctx.runQuery(api.reports.generateVisitorReport, {
      estateId: args.estateId,
      dateRange: args.dateRange,
      format: "detailed" as const,
    });

    // Generate CSV content
    const headers: string[] = [
      "Date",
      "Check-in Time", 
      "Check-out Time",
      "Guest Name",
      "ID Number",
      "Vehicle",
      "Purpose",
      "Host",
      "Unit",
      "Duration (hours)",
      "Status",
    ];

    const rows: string[][] = reportData.visits.map((visit: {
      checkinTime: number;
      checkoutTime?: number;
      guest: { name: string; idNumber: string; vehicleRegistration?: string } | null;
      purpose: string;
      resident: { name: string; unitNumber: string } | null;
      duration: number;
      status: string;
    }) => [
      new Date(visit.checkinTime).toLocaleDateString(),
      new Date(visit.checkinTime).toLocaleTimeString(),
      visit.checkoutTime ? new Date(visit.checkoutTime).toLocaleTimeString() : "Still in",
      visit.guest?.name || "Unknown",
      visit.guest?.idNumber || "",
      visit.guest?.vehicleRegistration || "",
      visit.purpose,
      visit.resident?.name || "Walk-in",
      visit.resident?.unitNumber || "",
      (visit.duration / (1000 * 60 * 60)).toFixed(2),
      visit.status.replace('_', ' '),
    ]);

    const csvContent: string = [headers, ...rows]
      .map(row => row.map((cell: string) => `"${cell}"`).join(','))
      .join('\n');

    return {
      content: csvContent,
      filename: `visitor-report-${new Date().toISOString().split('T')[0]}.csv`,
      summary: reportData.summary,
    };
  },
});

function calculatePeakHours(visits: Array<{ checkinTime: number }>): Array<{ hour: number; count: number }> {
  const hourCounts: { [hour: number]: number } = {};
  
  visits.forEach((visit) => {
    const hour = new Date(visit.checkinTime).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });

  const sortedHours = Object.entries(hourCounts)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 3)
    .map(([hour, count]) => ({ hour: parseInt(hour), count: count as number }));

  return sortedHours;
} 