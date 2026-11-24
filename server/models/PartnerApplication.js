import mongoose from "mongoose";

const vehicleOptionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    seatingCapacity: { type: String, required: true, trim: true },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (images) => images.length <= 4,
        message: "A vehicle can have at most 4 photos.",
      },
    },
  },
  { _id: false },
);

const roomTypePhotoSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    bedType: { type: String, trim: true, default: "" },
    maxGuests: { type: Number, default: 2, min: 1 },
    beds: { type: Number, default: 1, min: 1 },
    price: { type: Number, default: null, min: 0 },
    description: { type: String, trim: true, default: "" },
    amenities: { type: [String], default: [] },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (images) => images.length <= 4,
        message: "A room type can have at most 4 photos.",
      },
    },
  },
  { _id: false },
);

const listingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["Hotel", "Cab Operator", "Travel Guide"],
      required: true,
    },
    destination: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    vehicleOptions: { type: [vehicleOptionSchema], default: [] },
    active: { type: Boolean, default: true },
    images: { type: [String], default: [] },
    city: { type: String, trim: true, default: "" },
    state: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    price: { type: Number, default: null, min: 0 },
    priceLabel: { type: String, trim: true, default: "" },
    category: { type: String, trim: true, default: "" },
    rating: { type: Number, default: null, min: 0, max: 5 },
    roomTypes: { type: [String], default: [] },
    roomTypePhotos: { type: [roomTypePhotoSchema], default: [] },
    amenities: { type: [String], default: [] },
    contactPhone: { type: String, trim: true, default: "" },
    contactEmail: { type: String, trim: true, lowercase: true, default: "" },
    checkIn: { type: String, trim: true, default: "" },
    checkOut: { type: String, trim: true, default: "" },
    seatingCapacity: { type: Number, default: null, min: 1 },
    serviceAreas: { type: [String], default: [] },
    pickupLocations: { type: [String], default: [] },
    tourDuration: { type: String, trim: true, default: "" },
    languages: { type: [String], default: [] },
    includedServices: { type: [String], default: [] },
    availability: { type: String, trim: true, default: "" },
    terms: { type: [String], default: [] },
  },
  { timestamps: true },
);

const partnerApplicationSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    businessName: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    ownerEmail: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    state: { type: String, trim: true, default: "" },
    businessType: {
      type: String,
      enum: ["Hotel", "Cab Operator", "Travel Guide"],
      required: true,
    },
    destination: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
      index: true,
    },
    reviewNote: { type: String, trim: true, default: "" },
    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: String, default: null },
    listings: { type: [listingSchema], default: [] },
  },
  { timestamps: true },
);

const PartnerApplication = mongoose.model("PartnerApplication", partnerApplicationSchema);

export default PartnerApplication;
