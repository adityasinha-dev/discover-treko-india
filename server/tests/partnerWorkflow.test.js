import assert from "node:assert/strict";
import test from "node:test";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import PartnerApplication from "../models/PartnerApplication.js";
import Booking from "../models/Booking.js";
import { loginAdmin } from "../controllers/adminController.js";
import {
  createBooking,
  getBusinessDashboard,
  reviewPartnerApplication,
  submitPartnerApplication,
} from "../controllers/partnerController.js";
import { requireAdmin, requireApprovedBusiness, revokeAdminToken } from "../middleware/business.js";
import { createAdminLoginRateLimit } from "../middleware/adminLoginRateLimit.js";

const originalPartnerFindOne = PartnerApplication.findOne;
const originalPartnerCreate = PartnerApplication.create;
const originalPartnerFindOneAndUpdate = PartnerApplication.findOneAndUpdate;
const originalPartnerFind = PartnerApplication.find;
const originalBookingFind = Booking.find;
const originalBookingCreate = Booking.create;
const originalAdminId = process.env.ADMIN_ID;
const originalAdminPassword = process.env.ADMIN_PASSWORD;
const originalJwtSecret = process.env.JWT_SECRET;

function mockResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    set(name, value) {
      this.headers ??= {};
      this.headers[name] = value;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test.afterEach(() => {
  PartnerApplication.findOne = originalPartnerFindOne;
  PartnerApplication.create = originalPartnerCreate;
  PartnerApplication.findOneAndUpdate = originalPartnerFindOneAndUpdate;
  PartnerApplication.find = originalPartnerFind;
  Booking.find = originalBookingFind;
  Booking.create = originalBookingCreate;
  if (originalAdminId === undefined) delete process.env.ADMIN_ID;
  else process.env.ADMIN_ID = originalAdminId;
  if (originalAdminPassword === undefined) delete process.env.ADMIN_PASSWORD;
  else process.env.ADMIN_PASSWORD = originalAdminPassword;
  if (originalJwtSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = originalJwtSecret;
});

test("pending and rejected businesses cannot read the protected dashboard", async () => {
  for (const status of ["pending", "rejected"]) {
    PartnerApplication.findOne = async () => ({ status });
    const req = { user: { _id: "owner-id" } };
    const res = mockResponse();
    let continued = false;

    await requireApprovedBusiness(req, res, () => {
      continued = true;
    });

    assert.equal(res.statusCode, 403);
    assert.equal(res.body.status, status);
    assert.equal(continued, false);
  }
});

test("approved business dashboard queries bookings using only the authenticated business id", async () => {
  const businessId = "approved-business-id";
  const business = {
    _id: { toString: () => businessId },
    businessName: "Approved Lodge",
    ownerName: "Owner",
    ownerEmail: "owner@example.com",
    phone: "1234567890",
    businessType: "Hotel",
    destination: "Goa",
    description: "A listed hotel.",
    status: "approved",
    reviewNote: "",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    reviewedAt: null,
    listings: [
      {
        _id: { toString: () => "listing-id" },
        name: "Approved Lodge",
        type: "Hotel",
        destination: "Goa",
        description: "A listed hotel.",
      },
    ],
  };
  let bookingQuery;
  Booking.find = (query) => {
    bookingQuery = query;
    return {
      sort() {
        return this;
      },
      limit() {
        return this;
      },
      async lean() {
        return [
          {
            bookingId: "TRK-1",
            customerName: "Guest",
            customerEmail: "guest@example.com",
            destination: "Goa",
            createdAt: new Date(),
            status: "Pending",
            total: 2500,
            items: [],
          },
        ];
      },
    };
  };
  const req = { business };
  const res = mockResponse();

  await getBusinessDashboard(req, res, (error) => {
    throw error;
  });

  assert.deepEqual(bookingQuery, { businessIds: business._id });
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.application.status, "approved");
  assert.equal(res.body.bookings[0].id, "TRK-1");
});

test("booking persistence assigns the customer and partner from authenticated and stored records", async () => {
  const businessId = new mongoose.Types.ObjectId();
  const listingId = new mongoose.Types.ObjectId();
  let businessQuery;
  let savedBooking;
  PartnerApplication.find = (query) => {
    businessQuery = query;
    return {
      async select() {
        return [{ _id: businessId, listings: [{ _id: listingId }] }];
      },
    };
  };
  Booking.create = async (booking) => {
    savedBooking = booking;
    return {
      ...booking,
      bookingId: "TRK-123",
      createdAt: new Date("2026-02-01T00:00:00.000Z"),
    };
  };
  const res = mockResponse();

  await createBooking(
    {
      user: { _id: "authenticated-customer-id", name: "Customer", email: "customer@example.com" },
      body: {
        destination: "Goa",
        items: [
          {
            id: listingId.toString(),
            name: "Coastal Stay",
            type: "stay",
            destination: "Goa",
            quantity: 1,
            price: 2400,
          },
        ],
        total: 2400,
        businessIds: ["attacker-supplied-business-id"],
      },
    },
    res,
    (error) => {
      throw error;
    },
  );

  assert.equal(businessQuery.status, "approved");
  assert.equal(savedBooking.customerId, "authenticated-customer-id");
  assert.equal(savedBooking.customerEmail, "customer@example.com");
  assert.deepEqual(savedBooking.businessIds, [businessId]);
  assert.equal(res.statusCode, 201);
  assert.equal(res.body.booking.userId, "authenticated-customer-id");
});

test("application submission creates a pending application bound to the authenticated owner", async () => {
  PartnerApplication.findOne = async () => null;
  let savedApplication;
  PartnerApplication.create = async (application) => {
    savedApplication = application;
    return {
      ...application,
      _id: { toString: () => "application-id" },
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      reviewedAt: null,
      reviewNote: "",
      listings: [
        {
          _id: { toString: () => "listing-id" },
          ...application.listings[0],
          createdAt: new Date(),
        },
      ],
    };
  };
  const req = {
    user: { _id: "authenticated-owner-id", email: "owner@example.com" },
    body: {
      businessName: "Coastal Stay",
      ownerName: "Owner",
      phone: "1234567890",
      businessType: "Hotel",
      destination: "Goa",
      description: "A small guesthouse.",
      status: "approved",
    },
  };
  const res = mockResponse();

  await submitPartnerApplication(req, res, (error) => {
    throw error;
  });

  assert.equal(res.statusCode, 201);
  assert.equal(savedApplication.ownerId, "authenticated-owner-id");
  assert.equal(savedApplication.ownerEmail, "owner@example.com");
  assert.equal(savedApplication.status, "pending");
  assert.equal(res.body.application.status, "pending");
});

test("admin login returns a role-scoped token and invalid credentials share a generic response", async () => {
  process.env.ADMIN_ID = "treko-admin";
  process.env.ADMIN_PASSWORD = "correct-horse-battery-staple";
  process.env.JWT_SECRET = "test-only-jwt-secret";

  const invalidResponse = mockResponse();
  await loginAdmin(
    { body: { adminId: "unknown", password: "incorrect" } },
    invalidResponse,
    (error) => {
      throw error;
    },
  );
  assert.equal(invalidResponse.statusCode, 401);
  assert.equal(invalidResponse.body.message, "Invalid admin ID or password.");

  const wrongPasswordResponse = mockResponse();
  await loginAdmin(
    { body: { adminId: "treko-admin", password: "incorrect" } },
    wrongPasswordResponse,
    (error) => {
      throw error;
    },
  );
  assert.equal(wrongPasswordResponse.statusCode, 401);
  assert.equal(wrongPasswordResponse.body.message, invalidResponse.body.message);

  const loginResponse = mockResponse();
  await loginAdmin(
    { body: { adminId: "treko-admin", password: "correct-horse-battery-staple" } },
    loginResponse,
    (error) => {
      throw error;
    },
  );
  assert.equal(loginResponse.statusCode, 200);
  assert.equal("adminId" in loginResponse.body, false);
  assert.equal("password" in loginResponse.body, false);
  const decoded = jwt.verify(loginResponse.body.token, process.env.JWT_SECRET);
  assert.equal(decoded.role, "admin");

  const adminResponse = mockResponse();
  let adminContinued = false;
  requireAdmin(
    { headers: { authorization: `Bearer ${loginResponse.body.token}` } },
    adminResponse,
    () => {
      adminContinued = true;
    },
  );
  assert.equal(adminContinued, true);

  revokeAdminToken(decoded.jti, decoded.exp);
  const revokedResponse = mockResponse();
  let revokedContinued = false;
  requireAdmin(
    { headers: { authorization: `Bearer ${loginResponse.body.token}` } },
    revokedResponse,
    () => {
      revokedContinued = true;
    },
  );
  assert.equal(revokedResponse.statusCode, 401);
  assert.equal(revokedContinued, false);
});

test("admin login rate limit blocks repeated attempts", () => {
  let currentTime = 1000;
  const limiter = createAdminLoginRateLimit({
    windowMs: 60_000,
    maxAttempts: 2,
    now: () => currentTime,
  });
  const req = { ip: "192.0.2.10" };
  let nextCalls = 0;

  limiter(req, mockResponse(), () => {
    nextCalls += 1;
  });
  limiter(req, mockResponse(), () => {
    nextCalls += 1;
  });
  const limitedResponse = mockResponse();
  limiter(req, limitedResponse, () => {
    nextCalls += 1;
  });

  assert.equal(nextCalls, 2);
  assert.equal(limitedResponse.statusCode, 429);
  assert.equal(limitedResponse.headers["Retry-After"], "60");

  currentTime += 60_001;
  limiter(req, mockResponse(), () => {
    nextCalls += 1;
  });
  assert.equal(nextCalls, 3);
});

test("regular user tokens cannot access the admin workflow", () => {
  process.env.ADMIN_ID = "treko-admin";
  const res = mockResponse();
  let continued = false;

  requireAdmin({ headers: { authorization: "Bearer invalid" } }, res, () => {
    continued = true;
  });
  assert.equal(res.statusCode, 401);
  assert.equal(continued, false);
});

test("admin review only permits an atomic transition from pending", async () => {
  let filter;
  let update;
  PartnerApplication.findOneAndUpdate = async (candidateFilter, candidateUpdate) => {
    filter = candidateFilter;
    update = candidateUpdate;
    return {
      _id: { toString: () => "application-id" },
      businessName: "Coastal Stay",
      ownerName: "Owner",
      ownerEmail: "owner@example.com",
      phone: "1234567890",
      businessType: "Hotel",
      destination: "Goa",
      description: "A small guesthouse.",
      status: "approved",
      reviewNote: "Approved.",
      createdAt: new Date(),
      reviewedAt: new Date(),
      listings: [],
    };
  };
  const res = mockResponse();

  await reviewPartnerApplication(
    {
      params: { applicationId: "507f1f77bcf86cd799439011" },
      body: { status: "approved", reviewNote: "Approved." },
      user: { _id: "admin-id" },
    },
    res,
    (error) => {
      throw error;
    },
  );

  assert.equal(filter.status, "pending");
  assert.equal(update.$set.status, "approved");
  assert.equal(update.$set.reviewedBy, "admin-id");
  assert.equal(res.body.application.status, "approved");

  const invalidResponse = mockResponse();
  await reviewPartnerApplication(
    { params: { applicationId: "bad-id" }, body: { status: "pending" }, user: { _id: "admin-id" } },
    invalidResponse,
    (error) => {
      throw error;
    },
  );
  assert.equal(invalidResponse.statusCode, 400);
});
