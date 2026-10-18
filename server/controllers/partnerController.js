import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import PartnerApplication from "../models/PartnerApplication.js";

const allowedBusinessTypes = new Set(["Hotel", "Cab Operator", "Travel Guide"]);
const allowedDestinations = new Set(["Rishikesh", "Ujjain", "Shimla", "Goa", "Mumbai"]);

const toPublicApplication = (application) => ({
  id: application._id.toString(),
  businessName: application.businessName,
  ownerName: application.ownerName,
  ownerEmail: application.ownerEmail,
  phone: application.phone,
  businessType: application.businessType,
  destination: application.destination,
  description: application.description,
  status: application.status,
  reviewNote: application.reviewNote,
  createdAt: application.createdAt,
  reviewedAt: application.reviewedAt,
  listings: application.listings.map((listing) => ({
    id: listing._id.toString(),
    name: listing.name,
    type: listing.type,
    destination: listing.destination,
    description: listing.description,
    createdAt: listing.createdAt,
  })),
});

export const submitPartnerApplication = async (req, res, next) => {
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const { businessName, ownerName, phone, businessType, destination, description } = body;
    if (
      typeof businessName !== "string" ||
      typeof ownerName !== "string" ||
      typeof phone !== "string" ||
      typeof businessType !== "string" ||
      typeof destination !== "string" ||
      typeof description !== "string" ||
      !businessName.trim() ||
      !ownerName.trim() ||
      !phone.trim() ||
      !description.trim() ||
      phone.trim().length > 30
    ) {
      return res.status(400).json({ message: "Complete all required business details." });
    }

    if (!allowedBusinessTypes.has(businessType)) {
      return res.status(400).json({ message: "Choose a supported business type." });
    }

    if (!allowedDestinations.has(destination)) {
      return res.status(400).json({ message: "Choose one of Treko’s supported destinations." });
    }

    if (
      businessName.trim().length > 120 ||
      ownerName.trim().length > 120 ||
      description.trim().length > 1000
    ) {
      return res.status(400).json({ message: "One or more fields exceed the allowed length." });
    }

    const existing = await PartnerApplication.findOne({ ownerId: req.user._id });
    if (existing) {
      return res.status(409).json({
        message: "A partnership application already exists for this account.",
        status: existing.status,
      });
    }

    const application = await PartnerApplication.create({
      ownerId: req.user._id,
      businessName: businessName.trim(),
      ownerName: ownerName.trim(),
      ownerEmail: req.user.email,
      phone: phone.trim(),
      businessType,
      destination,
      description: description.trim(),
      status: "pending",
      listings: [
        {
          name: businessName.trim(),
          type: businessType,
          destination,
          description: description.trim(),
        },
      ],
    });

    return res.status(201).json({ application: toPublicApplication(application) });
  } catch (error) {
    if (error?.code === 11000) {
      return res
        .status(409)
        .json({ message: "A partnership application already exists for this account." });
    }
    return next(error);
  }
};

export const getMyPartnerStatus = async (req, res, next) => {
  try {
    const application = await PartnerApplication.findOne({ ownerId: req.user._id });
    return res
      .status(200)
      .json({ application: application ? toPublicApplication(application) : null });
  } catch (error) {
    return next(error);
  }
};

export const getBusinessDashboard = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ businessIds: req.business._id })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.status(200).json({
      application: toPublicApplication(req.business),
      bookings: bookings.map((booking) => ({
        id: booking.bookingId,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        destination: booking.destination,
        bookingDate: booking.createdAt,
        status: booking.status,
        total: booking.total,
        items: booking.items,
      })),
    });
  } catch (error) {
    return next(error);
  }
};

export const createBooking = async (req, res, next) => {
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const { destination, items, total, couponUsed } = body;
    if (
      typeof destination !== "string" ||
      !allowedDestinations.has(destination) ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !Number.isFinite(total) ||
      total < 0
    ) {
      return res.status(400).json({ message: "The booking details are invalid." });
    }

    const normalizedItems = items.map((item) => {
      if (
        !item ||
        typeof item.id !== "string" ||
        typeof item.name !== "string" ||
        typeof item.type !== "string" ||
        typeof item.destination !== "string" ||
        !allowedDestinations.has(item.destination)
      ) {
        throw Object.assign(new Error("The booking contains an invalid item."), { status: 400 });
      }
      return {
        listingId: item.id,
        name: item.name,
        type: item.type,
        destination: item.destination,
        packageName: typeof item.packageName === "string" ? item.packageName : "",
        quantity: Number.isFinite(item.quantity) && item.quantity > 0 ? item.quantity : 1,
        price: Number.isFinite(item.price) && item.price >= 0 ? item.price : 0,
        bookingMeta:
          item.bookingMeta && typeof item.bookingMeta === "object" ? item.bookingMeta : {},
      };
    });

    const listingIds = normalizedItems
      .map((item) => item.listingId)
      .filter((id) => mongoose.isValidObjectId(id));
    const listingTypes = { stay: "Hotel", cab: "Cab Operator", guide: "Travel Guide" };
    const listingMatches = normalizedItems.map((item) => ({
      "listings.name": item.name,
      "listings.destination": item.destination,
      "listings.type": listingTypes[item.type] ?? item.type,
    }));
    const matchingBusinesses = await PartnerApplication.find({
      status: "approved",
      $or: [
        ...(listingIds.length ? [{ "listings._id": { $in: listingIds } }] : []),
        ...listingMatches,
      ],
    }).select("_id listings");
    const businessIds = matchingBusinesses
      .filter((business) =>
        business.listings.some((listing) =>
          normalizedItems.some(
            (item) =>
              item.listingId === listing._id.toString() ||
              (item.name === listing.name &&
                item.destination === listing.destination &&
                (listingTypes[item.type] ?? item.type) === listing.type),
          ),
        ),
      )
      .map((business) => business._id);

    const booking = await Booking.create({
      bookingId: `TRK-${new mongoose.Types.ObjectId().toString().slice(-6).toUpperCase()}`,
      customerId: req.user._id,
      customerName: req.user.name,
      customerEmail: req.user.email,
      destination,
      items: normalizedItems,
      businessIds,
      total,
      couponUsed: typeof couponUsed === "string" && couponUsed ? couponUsed : null,
    });

    return res.status(201).json({
      booking: {
        id: booking.bookingId,
        userId: booking.customerId.toString(),
        userName: booking.customerName,
        destination: booking.destination,
        hotel: normalizedItems.find((item) => item.type === "stay")?.name ?? null,
        cab: normalizedItems.find((item) => item.type === "cab")?.name ?? null,
        guide: normalizedItems.find((item) => item.type === "guide")?.name ?? null,
        items,
        total: booking.total,
        couponUsed: booking.couponUsed,
        bookingDate: booking.createdAt.toISOString(),
        status: booking.status,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const listPartnerApplications = async (req, res, next) => {
  try {
    const applications = await PartnerApplication.find().sort({ createdAt: -1 }).limit(200);
    return res.status(200).json({ applications: applications.map(toPublicApplication) });
  } catch (error) {
    return next(error);
  }
};

export const reviewPartnerApplication = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.applicationId)) {
      return res.status(400).json({ message: "The application ID is invalid." });
    }

    const body = req.body && typeof req.body === "object" ? req.body : {};
    const { status, reviewNote = "" } = body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Choose approve or reject." });
    }
    if (typeof reviewNote !== "string" || reviewNote.length > 1000) {
      return res.status(400).json({ message: "The review note is invalid." });
    }

    const application = await PartnerApplication.findOneAndUpdate(
      { _id: req.params.applicationId, status: "pending" },
      {
        $set: {
          status,
          reviewNote: reviewNote.trim(),
          reviewedAt: new Date(),
          reviewedBy: req.user._id,
        },
      },
      { new: true, runValidators: true },
    );

    if (!application) {
      return res
        .status(404)
        .json({ message: "Pending application not found; it may already have been reviewed." });
    }

    return res.status(200).json({ application: toPublicApplication(application) });
  } catch (error) {
    return next(error);
  }
};
