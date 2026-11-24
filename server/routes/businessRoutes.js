import express from "express";
import {
  createPartnerListing,
  confirmBusinessBooking,
  deletePartnerListing,
  getBusinessDashboard,
  getMyPartnerStatus,
  getPublicCabVehicleImages,
  updatePartnerListing,
  updateVehicleImages,
} from "../controllers/partnerController.js";
import { requireApprovedBusiness } from "../middleware/business.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/vehicles", getPublicCabVehicleImages);
router.use(protect);
router.get("/status", getMyPartnerStatus);
router.get("/dashboard", requireApprovedBusiness, getBusinessDashboard);
router.patch("/bookings/:bookingId/confirm", requireApprovedBusiness, confirmBusinessBooking);
router.post("/listings", requireApprovedBusiness, createPartnerListing);
router.patch("/listings/:listingId", requireApprovedBusiness, updatePartnerListing);
router.delete("/listings/:listingId", requireApprovedBusiness, deletePartnerListing);
router.put(
  "/listings/:listingId/vehicles/:vehicleName/images",
  requireApprovedBusiness,
  updateVehicleImages,
);

export default router;
