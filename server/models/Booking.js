import mongoose from "mongoose";

const bookingItemSchema = new mongoose.Schema(
  {
    listingId: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    destination: { type: String, required: true },
    packageName: { type: String, default: "" },
    quantity: { type: Number, default: 1 },
    price: { type: Number, default: 0 },
    bookingMeta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false },
);

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true, index: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    destination: { type: String, required: true },
    items: { type: [bookingItemSchema], default: [] },
    businessIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "PartnerApplication", index: true }],
    total: { type: Number, required: true, min: 0 },
    couponUsed: { type: String, default: null },
    status: { type: String, enum: ["Pending", "Confirmed", "Cancelled"], default: "Pending" },
  },
  { timestamps: true },
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
