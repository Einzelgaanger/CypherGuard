import { mutation } from "./_generated/server";

// DISABLED: Legacy seed function - use migration.ts utilities instead
/*
export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    // Create sample estate
    const estateId = await ctx.db.insert("estates", {
      name: "Riverside Gardens Estate",
      address: "123 Riverside Drive, Nairobi",
      settings: {
        overstayThresholdHours: 8,
        requirePhotoUpload: false,
        allowWalkIns: true,
      },
    });

    // Create sample admin user
    const adminUserId = await ctx.db.insert("users", {
      email: "admin@cypher.com",
      phone: "+254700000000",
      role: "admin",
      isActive: true,
    });

    // Create sample resident
    const residentUserId = await ctx.db.insert("users", {
      email: "resident@example.com",
      phone: "+254700000001",
      role: "resident",
      isActive: true,
    });

    // Create sample registration request
    await ctx.db.insert("user_registration_requests", {
      email: "newuser@example.com",
      phone: "+254700000002",
      role: "resident",
      firstName: "Jane",
      lastName: "Smith",
      nationalId: "12345678",
      requestReason: "I'm a new resident moving into the estate and need access to the visitor management system.",
      status: "pending",
      requestedAt: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago
    });

    const residentId = await ctx.db.insert("residents", {
      userId: residentUserId,
      estateId,
      unitNumber: "A-101",
      name: "John Resident",
      isVerified: true,
    });

    // Create another resident
    const resident2UserId = await ctx.db.insert("users", {
      email: "resident2@example.com",
      phone: "+254700000002",
      role: "resident", 
      isActive: true,
    });

    const resident2Id = await ctx.db.insert("residents", {
      userId: resident2UserId,
      estateId,
      unitNumber: "B-205",
      name: "Jane Smith",
      isVerified: true,
    });

    // Create sample guests
    const guest1Id = await ctx.db.insert("guests", {
      name: "Alice Johnson",
      idNumber: "12345678",
      vehicleRegistration: "KAA 123A",
      phone: "+254712345678",
    });

    const guest2Id = await ctx.db.insert("guests", {
      name: "Bob Wilson", 
      idNumber: "87654321",
      phone: "+254787654321",
    });

    const guest3Id = await ctx.db.insert("guests", {
      name: "Charlie Brown",
      idNumber: "11223344",
      vehicleRegistration: "KBB 456C",
      phone: "+254722334455",
    });

    // Create sample visits
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const twoHoursAgo = now - (2 * 60 * 60 * 1000);
    const threeHoursAgo = now - (3 * 60 * 60 * 1000);

    // Current checked-in visits
    await ctx.db.insert("visits", {
      guestId: guest1Id,
      residentId: residentId,
      estateId,
      checkinTime: oneHourAgo,
      purpose: "business",
      status: "checked_in",
    });

    await ctx.db.insert("visits", {
      guestId: guest3Id,
      residentId: resident2Id,
      estateId,
      checkinTime: twoHoursAgo,
      purpose: "personal",
      status: "checked_in",
    });

    // Completed visit
    await ctx.db.insert("visits", {
      guestId: guest2Id,
      residentId: residentId,
      estateId,
      checkinTime: threeHoursAgo,
      checkoutTime: oneHourAgo,
      purpose: "delivery",
      status: "checked_out",
    });

    // Create sample invitation
    await ctx.db.insert("invitations", {
      residentId: residentId,
      guestName: "David Clark",
      guestIdNumber: "55667788",
      guestPhone: "+254755667788",
      token: "sample-invitation-token-123",
      expiresAt: now + (24 * 60 * 60 * 1000), // 24 hours from now
      isUsed: false,
      arrivalWindow: {
        from: now + (60 * 60 * 1000), // 1 hour from now
        to: now + (4 * 60 * 60 * 1000), // 4 hours from now
      },
    });

    return { 
      success: true, 
      estateId, 
      adminUserId, 
      residentUserId,
      message: "Database seeded with comprehensive test data"
    };
  },
}); 
*/ 