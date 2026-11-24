import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Booking from "../models/Booking.js";
import PartnerApplication from "../models/PartnerApplication.js";
import User from "../models/User.js";

const allowedBusinessTypes = new Set(["Hotel", "Cab Operator", "Travel Guide"]);
const allowedDestinations = new Set(["Rishikesh", "Ujjain", "Shimla", "Goa", "Mumbai"]);
const allowedCustomerGenders = new Set(["Female", "Male", "Non-binary", "Other", "Prefer not to say"]);
const defaultCabVehicles = [
  { name: "Sedan", seatingCapacity: "Up to 4 passengers" },
  { name: "SUV", seatingCapacity: "Up to 6 passengers" },
  { name: "Tempo Traveller", seatingCapacity: "Up to 12 passengers" },
  { name: "Mini Van", seatingCapacity: "Up to 8 passengers" },
];
const allowedVehicleNames = new Set(defaultCabVehicles.map((vehicle) => vehicle.name));
const maxVehicleImageBytes = 512 * 1024;
const maxVehicleImages = 4;

const getVehicleOptions = (listing) =>
  listing.vehicleOptions?.length
    ? listing.vehicleOptions
    : listing.type === "Cab Operator"
      ? defaultCabVehicles.map((vehicle) => ({ ...vehicle, images: [] }))
      : [];

const toPublicApplication = (application, { includeContactDetails = false } = {}) => ({
  id: application._id.toString(),
  businessName: application.businessName,
  ownerName: application.ownerName,
  ownerEmail: application.ownerEmail,
  phone: application.phone,
  businessType: application.businessType,
  destination: application.destination,
  description: application.description,
  address: application.address ?? "",
  city: application.city ?? "",
  state: application.state ?? "",
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
    active: listing.active !== false,
    images: listing.images ?? [],
    city: listing.city ?? "",
    state: listing.state ?? "",
    address: listing.address ?? "",
    price: listing.price ?? null,
    priceLabel: listing.priceLabel ?? "",
    category: listing.category ?? "",
    rating: listing.rating ?? null,
    roomTypes: listing.roomTypes ?? [],
    roomTypePhotos: (listing.roomTypePhotos ?? []).map((room) => ({
      name: room.name,
      bedType: room.bedType ?? "",
      maxGuests: room.maxGuests ?? 2,
      beds: room.beds ?? 1,
      price: room.price ?? null,
      description: room.description ?? "",
      amenities: room.amenities ?? [],
      images: room.images ?? [],
    })),
    amenities: listing.amenities ?? [],
    ...(includeContactDetails
      ? {
          contactPhone: listing.contactPhone ?? "",
          contactEmail: listing.contactEmail ?? "",
        }
      : {}),
    checkIn: listing.checkIn ?? "",
    checkOut: listing.checkOut ?? "",
    seatingCapacity: listing.seatingCapacity ?? null,
    serviceAreas: listing.serviceAreas ?? [],
    pickupLocations: listing.pickupLocations ?? [],
    tourDuration: listing.tourDuration ?? "",
    languages: listing.languages ?? [],
    includedServices: listing.includedServices ?? [],
    availability: listing.availability ?? "",
    terms: listing.terms ?? [],
    vehicleOptions: getVehicleOptions(listing).map((vehicle) => ({
      name: vehicle.name,
      seatingCapacity: vehicle.seatingCapacity,
      images: vehicle.images,
    })),
    createdAt: listing.createdAt,
  })),
});

const generatePartnerToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET || "treko-demo-secret", { expiresIn: "7d" });

export const registerPartner = async (req, res, next) => {
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const { ownerName, businessName, email, phone, password, businessType, destination, description,
      address = "", city = "", state = "" } = body;
    if (![ownerName, businessName, email, phone, password, businessType, destination, description].every(
      (value) => typeof value === "string" && value.trim(),
    )) {
      return res.status(400).json({ message: "Complete all required partner registration fields." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ message: "Please enter a valid email address." });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long." });
    }
    if (!allowedBusinessTypes.has(businessType) || !allowedDestinations.has(destination)) {
      return res.status(400).json({ message: "Choose a valid partner category and destination." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (await User.findOne({ email: normalizedEmail })) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const user = await User.create({
      name: ownerName.trim(),
      email: normalizedEmail,
      password,
    });
    const application = await PartnerApplication.create({
      ownerId: user._id,
      businessName: businessName.trim(),
      ownerName: ownerName.trim(),
      ownerEmail: normalizedEmail,
      phone: phone.trim(),
      businessType,
      destination,
      description: description.trim(),
      status: "pending",
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      listings: [],
    });

    return res.status(201).json({
      message: "Partner application submitted successfully.",
      application: toPublicApplication(application),
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "An account or application with this email already exists." });
    }
    return next(error);
  }
};

export const loginPartner = async (req, res, next) => {
  try {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    const application = await PartnerApplication.findOne({ ownerId: user._id });
    if (!application) {
      return res.status(403).json({ message: "No partner application is linked to this account." });
    }
    if (application.status !== "approved") {
      return res.status(403).json({
        message: `Partner access is unavailable because this application is ${application.status}.`,
        status: application.status,
      });
    }

    return res.status(200).json({
      token: generatePartnerToken(user._id),
      partner: toPublicApplication(application, { includeContactDetails: true }),
      user: { id: user._id.toString(), name: user.name, email: user.email },
    });
  } catch (error) {
    return next(error);
  }
};

const stringArray = (value) =>
  Array.isArray(value) ? value.map((item) => String(item).trim()).filter(Boolean).slice(0, 50) : [];

const validateDataImages = (images, maximum) => {
  if (!Array.isArray(images) || images.length > maximum) return false;
  return images.every((image) => {
    if (typeof image !== "string") return false;
    const match = image.match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/);
    if (!match || match[2].length % 4 !== 0) return false;
    const bytes = Buffer.from(match[2], "base64");
    if (bytes.length === 0 || bytes.length > maxVehicleImageBytes) return false;
    if (match[1] === "jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    if (match[1] === "png") return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    return bytes.length >= 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
  });
};

export const createPartnerListing = async (req, res, next) => {
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const type = typeof body.type === "string" ? body.type : req.business.businessType;
    if (!name || !description || name.length > 160 || description.length > 3000) {
      return res.status(400).json({ message: "Name and description are required for a listing." });
    }
    if (type !== req.business.businessType) {
      return res.status(403).json({ message: "You can only create listings for your partner category." });
    }
    if (!validateDataImages(body.images, 12)) {
      return res.status(400).json({ message: "General photos must be valid JPEG, PNG, or WebP images up to 512 KB each." });
    }
    const roomTypes = stringArray(body.roomTypes);
    const roomTypePhotos = Array.isArray(body.roomTypePhotos)
      ? body.roomTypePhotos.map((room) => ({
          name: typeof room?.name === "string" ? room.name.trim() : "",
          bedType: typeof room?.bedType === "string" ? room.bedType.trim() : "",
          maxGuests: Number.isFinite(Number(room?.maxGuests)) ? Math.max(1, Number(room.maxGuests)) : 2,
          beds: Number.isFinite(Number(room?.beds)) ? Math.max(1, Number(room.beds)) : 1,
          price: Number.isFinite(Number(room?.price)) ? Number(room.price) : null,
          description: typeof room?.description === "string" ? room.description.trim() : "",
          amenities: stringArray(room?.amenities),
          images: Array.isArray(room?.images) ? room.images : [],
        })).filter((room) => room.name && roomTypes.includes(room.name)).slice(0, 20)
      : [];
    if (roomTypePhotos.some((room) => !validateDataImages(room.images, 4))) {
      return res.status(400).json({ message: "Room photos must be valid JPEG, PNG, or WebP images up to 512 KB each." });
    }

    const listing = req.business.listings.create({
      name,
      type,
      destination: req.business.destination,
      description,
      active: body.active !== false,
      images: stringArray(body.images).slice(0, 12),
      city: typeof body.city === "string" ? body.city.trim() : "",
      state: typeof body.state === "string" ? body.state.trim() : "",
      address: typeof body.address === "string" ? body.address.trim() : "",
      price: Number.isFinite(Number(body.price)) ? Number(body.price) : null,
      priceLabel: typeof body.priceLabel === "string" ? body.priceLabel.trim() : "",
      category: typeof body.category === "string" ? body.category.trim() : "",
      rating: Number.isFinite(Number(body.rating)) ? Number(body.rating) : null,
      roomTypes,
      roomTypePhotos,
      amenities: stringArray(body.amenities),
      contactPhone: typeof body.contactPhone === "string" ? body.contactPhone.trim() : "",
      contactEmail: typeof body.contactEmail === "string" ? body.contactEmail.trim().toLowerCase() : "",
      checkIn: typeof body.checkIn === "string" ? body.checkIn.trim() : "",
      checkOut: typeof body.checkOut === "string" ? body.checkOut.trim() : "",
      seatingCapacity: Number.isFinite(Number(body.seatingCapacity)) ? Number(body.seatingCapacity) : null,
      serviceAreas: stringArray(body.serviceAreas),
      pickupLocations: stringArray(body.pickupLocations),
      tourDuration: typeof body.tourDuration === "string" ? body.tourDuration.trim() : "",
      languages: stringArray(body.languages),
      includedServices: stringArray(body.includedServices),
      availability: typeof body.availability === "string" ? body.availability.trim() : "",
      terms: stringArray(body.terms),
    });
    req.business.listings.push(listing);
    await req.business.save();
    const created = toPublicApplication(req.business, { includeContactDetails: true }).listings.find((item) => item.id === listing._id.toString());
    return res.status(201).json({ listing: created });
  } catch (error) {
    return next(error);
  }
};

export const updatePartnerListing = async (req, res, next) => {
  try {
    const listing = req.business.listings.id(req.params.listingId);
    if (!listing) return res.status(404).json({ message: "Listing not found." });
    const body = req.body && typeof req.body === "object" ? req.body : {};
    for (const field of ["name", "description", "city", "state", "address", "priceLabel", "category", "contactPhone", "contactEmail", "checkIn", "checkOut", "tourDuration"]) {
      if (typeof body[field] === "string") listing[field] = body[field].trim();
    }
    if (typeof body.active === "boolean") listing.active = body.active;
    if (typeof body.availability === "string") listing.availability = body.availability.trim();
    if (body.terms !== undefined) listing.terms = stringArray(body.terms);
    for (const field of ["images", "roomTypes", "amenities", "serviceAreas", "pickupLocations", "languages", "includedServices"]) {
      if (body[field] !== undefined) listing[field] = stringArray(body[field]);
    }
    if (Array.isArray(body.roomTypePhotos)) {
      const roomTypeNames = Array.isArray(body.roomTypes)
        ? stringArray(body.roomTypes)
        : listing.roomTypes;
      const roomTypePhotos = body.roomTypePhotos.map((room) => ({
        name: typeof room?.name === "string" ? room.name.trim() : "",
        bedType: typeof room?.bedType === "string" ? room.bedType.trim() : "",
        maxGuests: Number.isFinite(Number(room?.maxGuests)) ? Math.max(1, Number(room.maxGuests)) : 2,
        beds: Number.isFinite(Number(room?.beds)) ? Math.max(1, Number(room.beds)) : 1,
        price: Number.isFinite(Number(room?.price)) ? Number(room.price) : null,
        description: typeof room?.description === "string" ? room.description.trim() : "",
        amenities: stringArray(room?.amenities),
        images: Array.isArray(room?.images) ? room.images : [],
      })).filter((room) => room.name && roomTypeNames.includes(room.name)).slice(0, 20);
      if (roomTypePhotos.some((room) => !validateDataImages(room.images, 4))) {
        return res.status(400).json({ message: "Room photos must be valid JPEG, PNG, or WebP images up to 512 KB each." });
      }
      listing.roomTypePhotos = roomTypePhotos;
    }
    for (const field of ["price", "rating", "seatingCapacity"]) {
      if (body[field] !== undefined && Number.isFinite(Number(body[field]))) listing[field] = Number(body[field]);
    }
    await req.business.save();
    const updated = toPublicApplication(req.business, { includeContactDetails: true }).listings.find((item) => item.id === listing._id.toString());
    return res.status(200).json({ listing: updated });
  } catch (error) {
    return next(error);
  }
};

export const deletePartnerListing = async (req, res, next) => {
  try {
    const listing = req.business.listings.id(req.params.listingId);
    if (!listing) return res.status(404).json({ message: "Listing not found." });
    listing.deleteOne();
    await req.business.save();
    return res.status(200).json({ message: "Listing deleted." });
  } catch (error) {
    return next(error);
  }
};

export const getPublicPartnerListings = async (req, res, next) => {
  try {
    const typeFilter = typeof req.query.type === "string" ? req.query.type : "";
    const typeMap = { hotel: "Hotel", stay: "Hotel", cab: "Cab Operator", guide: "Travel Guide" };
    const type = typeMap[typeFilter] ?? typeFilter;
    const query = { status: "approved", "listings.active": true };
    if (type) query["listings.type"] = type;
    if (typeof req.query.destination === "string" && req.query.destination.trim()) {
      query["listings.destination"] = req.query.destination.trim();
    }
    const applications = await PartnerApplication.find(query).select("businessName ownerName phone ownerEmail businessType destination address city state listings");
    const listings = applications.flatMap((application) =>
      application.listings
        .filter((listing) => listing.active !== false && (!type || listing.type === type))
        .map((listing) => ({
          ...toPublicApplication({ ...application.toObject(), listings: [listing] }).listings[0],
          businessName: application.businessName,
          partnerId: application._id.toString(),
        })),
    );
    return res.status(200).json({ listings });
  } catch (error) {
    return next(error);
  }
};

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
          vehicleOptions:
            businessType === "Cab Operator"
              ? defaultCabVehicles.map((vehicle) => ({ ...vehicle, images: [] }))
              : [],
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

export const updateVehicleImages = async (req, res, next) => {
  try {
    const { listingId, vehicleName } = req.params;
    const images = req.body?.images;

    if (!Array.isArray(images) || images.length > maxVehicleImages) {
      return res.status(400).json({ message: "Choose between 0 and 4 vehicle photos." });
    }

    if (!images.every((image) => {
      if (typeof image !== "string") return false;
      const match = image.match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/);
      if (!match || match[2].length % 4 !== 0) return false;
      const bytes = Buffer.from(match[2], "base64");
      if (bytes.length === 0 || bytes.length > maxVehicleImageBytes) return false;
      if (match[1] === "jpeg") {
        return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
      }
      if (match[1] === "png") {
        return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
      }
      return (
        bytes.length >= 12 &&
        bytes.toString("ascii", 0, 4) === "RIFF" &&
        bytes.toString("ascii", 8, 12) === "WEBP"
      );
    })) {
      return res.status(400).json({
        message: "Vehicle photos must be valid JPEG, PNG, or WebP images no larger than 512 KB each.",
      });
    }

    if (!allowedVehicleNames.has(vehicleName)) {
      return res.status(400).json({ message: "Choose a supported vehicle type." });
    }

    const listing = req.business.listings.id(listingId);
    if (!listing || listing.type !== "Cab Operator") {
      return res.status(404).json({ message: "Cab listing not found." });
    }

    if (!listing.vehicleOptions?.some((option) => option.name === vehicleName)) {
      listing.vehicleOptions = getVehicleOptions(listing);
    }
    const selectedVehicle = listing.vehicleOptions.find((option) => option.name === vehicleName);
    if (!selectedVehicle) {
      return res.status(404).json({ message: "Vehicle option not found." });
    }

    selectedVehicle.images = images;
    await req.business.save();

    return res.status(200).json({
      listing: toPublicApplication(req.business, { includeContactDetails: true }).listings.find((item) => item.id === listingId),
    });
  } catch (error) {
    return next(error);
  }
};

export const getPublicCabVehicleImages = async (req, res, next) => {
  try {
    const { name, destination } = req.query;
    if (
      typeof name !== "string" ||
      !name.trim() ||
      name.trim().length > 120 ||
      typeof destination !== "string" ||
      !allowedDestinations.has(destination)
    ) {
      return res.status(400).json({ message: "A valid cab listing name and destination are required." });
    }

    const application = await PartnerApplication.findOne({
      status: "approved",
      "listings.name": name.trim(),
      "listings.destination": destination,
      "listings.type": "Cab Operator",
    }).select("listings");

    const listing = application?.listings.find(
      (item) =>
        item.name === name.trim() &&
        item.destination === destination &&
        item.type === "Cab Operator",
    );

    return res.status(200).json({
      vehicleOptions: listing?.vehicleOptions?.map((vehicle) => ({
        name: vehicle.name,
        images: vehicle.images,
      })) ?? [],
    });
  } catch (error) {
    return next(error);
  }
};

export const getMyPartnerStatus = async (req, res, next) => {
  try {
    const application = await PartnerApplication.findOne({ ownerId: req.user._id });
    return res
      .status(200)
      .json({ application: application ? toPublicApplication(application, { includeContactDetails: true }) : null });
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
      application: toPublicApplication(req.business, { includeContactDetails: true }),
      bookings: bookings.map((booking) => ({
        id: booking.bookingId,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone,
        customerGender: booking.customerGender,
        customerPreferences: booking.customerPreferences,
        destination: booking.destination,
        bookingDate: booking.createdAt,
        status: booking.status,
        confirmedByCurrentBusiness: (booking.confirmedBusinessIds ?? []).some(
          (businessId) => businessId.toString() === req.business._id.toString(),
        ),
        total: booking.total,
        items: booking.items,
      })),
    });
  } catch (error) {
    return next(error);
  }
};

export const confirmBusinessBooking = async (req, res, next) => {
  try {
    const businessId = req.business._id;
    const booking = await Booking.findOneAndUpdate(
      {
        bookingId: req.params.bookingId,
        businessIds: businessId,
        status: { $ne: "Cancelled" },
      },
      { $addToSet: { confirmedBusinessIds: businessId } },
      { returnDocument: "after" },
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found for this business." });
    }

    const allBusinessesConfirmed = booking.businessIds.every((partnerId) =>
      (booking.confirmedBusinessIds ?? []).some(
        (confirmedId) => confirmedId.toString() === partnerId.toString(),
      ),
    );
    if (allBusinessesConfirmed && booking.status === "Pending") {
      await Booking.updateOne(
        { _id: booking._id, status: "Pending" },
        { $set: { status: "Confirmed" } },
      );
      booking.status = "Confirmed";
    }

    return res.status(200).json({
      booking: {
        status: booking.status,
        confirmedByCurrentBusiness: true,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const createBooking = async (req, res, next) => {
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const { destination, items, total, couponUsed } = body;
    const rawCustomerDetails =
      body.customerDetails &&
      typeof body.customerDetails === "object" &&
      !Array.isArray(body.customerDetails)
        ? body.customerDetails
        : {};
    const customerName =
      typeof rawCustomerDetails.name === "string" ? rawCustomerDetails.name.trim() : "";
    const customerEmail =
      typeof rawCustomerDetails.email === "string"
        ? rawCustomerDetails.email.trim().toLowerCase()
        : "";
    const customerPhone =
      typeof rawCustomerDetails.phone === "string" ? rawCustomerDetails.phone.trim() : "";
    const customerPhoneDigits = customerPhone.replace(/\D/g, "");
    const customerGender =
      typeof rawCustomerDetails.gender === "string" ? rawCustomerDetails.gender : "";
    const customerPreferences =
      typeof rawCustomerDetails.preferences === "string"
        ? rawCustomerDetails.preferences.trim()
        : "";
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
    if (
      customerName.length < 2 ||
      customerName.length > 120 ||
      customerEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail) ||
      !/^\+?[0-9\s().-]+$/.test(customerPhone) ||
      customerPhoneDigits.length < 7 ||
      customerPhoneDigits.length > 15 ||
      !allowedCustomerGenders.has(customerGender) ||
      customerPreferences.length > 1000
    ) {
      return res.status(400).json({ message: "Please provide valid customer details." });
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
        category: typeof item.category === "string" ? item.category : item.type,
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
    }).select("_id businessName ownerEmail phone address city state listings");
    const businessDetails = matchingBusinesses.flatMap((business) =>
      business.listings
        .filter((listing) =>
          normalizedItems.some(
            (item) =>
              item.listingId === listing._id.toString() ||
              (item.name === listing.name &&
                item.destination === listing.destination &&
                (listingTypes[item.type] ?? item.type) === listing.type),
          ),
        )
        .map((listing) => ({
          businessId: business._id,
          businessName: business.businessName ?? listing.name ?? "Treko business",
          listingName: listing.name ?? business.businessName ?? "Listing",
          listingType: listing.type ?? "",
          phone: listing.contactPhone || business.phone || "",
          email:
            typeof listing.contactEmail === "string" &&
            listing.contactEmail.trim().toLowerCase() !==
              (business.ownerEmail ?? "").trim().toLowerCase()
              ? listing.contactEmail.trim().toLowerCase()
              : "",
          address:
            listing.address ||
            business.address ||
            [listing.city || business.city, listing.state || business.state].filter(Boolean).join(", "),
        })),
    );
    const businessIds = [...new Map(
      businessDetails.map((business) => [business.businessId.toString(), business.businessId]),
    ).values()];

    const booking = await Booking.create({
      bookingId: `TRK-${new mongoose.Types.ObjectId().toString().slice(-6).toUpperCase()}`,
      customerId: req.user._id,
      customerName,
      customerEmail,
      customerPhone,
      customerGender,
      customerPreferences,
      destination,
      items: normalizedItems,
      businessIds,
      businesses: businessDetails.map(({ businessId, ...business }) => business),
      total,
      couponUsed: typeof couponUsed === "string" && couponUsed ? couponUsed : null,
      paymentStatus: "Unpaid",
    });

    return res.status(201).json({
      booking: {
        id: booking.bookingId,
        userId: booking.customerId.toString(),
        userName: booking.customerName,
        customerDetails: {
          name: booking.customerName,
          email: booking.customerEmail,
          phone: booking.customerPhone,
          gender: booking.customerGender,
          preferences: booking.customerPreferences,
        },
        destination: booking.destination,
        hotel: normalizedItems.find((item) => item.type === "stay")?.name ?? null,
        cab: normalizedItems.find((item) => item.type === "cab")?.name ?? null,
        guide: normalizedItems.find((item) => item.type === "guide")?.name ?? null,
        items,
        businesses: booking.businesses,
        total: booking.total,
        couponUsed: booking.couponUsed,
        bookingDate: booking.createdAt.toISOString(),
        status: booking.status,
        paymentStatus: booking.paymentStatus ?? "Unpaid",
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ customerId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.status(200).json({
      bookings: bookings.map((booking) => ({
        id: booking.bookingId,
        userId: booking.customerId.toString(),
        userName: booking.customerName,
        destination: booking.destination,
        hotel: booking.items.find((item) => item.type === "stay")?.name ?? null,
        cab: booking.items.find((item) => item.type === "cab")?.name ?? null,
        guide: booking.items.find((item) => item.type === "guide")?.name ?? null,
        items: booking.items.map((item) => ({
          id: item.listingId,
          type: item.type,
          category: item.category || item.type,
          name: item.name,
          image: "",
          location: item.destination,
          packageName: item.packageName,
          price: item.price,
          quantity: item.quantity,
          destination: item.destination,
          bookingMeta: item.bookingMeta ?? {},
        })),
        total: booking.total,
        couponUsed: booking.couponUsed,
        bookingDate: booking.createdAt.toISOString(),
        status: booking.status,
        paymentStatus: booking.paymentStatus ?? "Unpaid",
        customerDetails: {
          name: booking.customerName,
          email: booking.customerEmail,
          phone: booking.customerPhone ?? "",
          gender: booking.customerGender ?? "Prefer not to say",
          preferences: booking.customerPreferences ?? "",
        },
        businesses: booking.businesses ?? [],
      })),
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
    if (!["approved", "rejected", "suspended", "reactivated"].includes(status)) {
      return res.status(400).json({ message: "Choose approve, reject, suspend, or reactivate." });
    }
    if (typeof reviewNote !== "string" || reviewNote.length > 1000) {
      return res.status(400).json({ message: "The review note is invalid." });
    }

    const newStatus = status === "reactivated" ? "approved" : status;
    const reviewFilter =
      status === "suspended"
        ? { _id: req.params.applicationId, status: "approved" }
        : status === "reactivated"
          ? { _id: req.params.applicationId, status: "suspended" }
          : { _id: req.params.applicationId, status: "pending" };
    const application = await PartnerApplication.findOneAndUpdate(
      reviewFilter,
      {
        $set: {
          status: newStatus,
          reviewNote: reviewNote.trim(),
          reviewedAt: new Date(),
          reviewedBy: req.admin?.id ?? req.user?._id?.toString() ?? "admin",
        },
      },
      { new: true, runValidators: true },
    );

    if (!application) {
      return res
        .status(404)
        .json({ message: "Pending application not found; it may already have been reviewed." });
    }

    return res.status(200).json({
      application: toPublicApplication(application, { includeContactDetails: true }),
    });
  } catch (error) {
    return next(error);
  }
};
