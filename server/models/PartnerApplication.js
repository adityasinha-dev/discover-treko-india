import mongoose from "mongoose";

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
    businessType: {
      type: String,
      enum: ["Hotel", "Cab Operator", "Travel Guide"],
      required: true,
    },
    destination: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
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
