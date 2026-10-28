import express from "express";
import {
  getBusinessDashboard,
  getMyPartnerStatus,
  getPublicCabVehicleImages,
  updateVehicleImages,
} from "../controllers/partnerController.js";
import { requireApprovedBusiness } from "../middleware/business.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/vehicles", getPublicCabVehicleImages);
router.use(protect);
router.get("/status", getMyPartnerStatus);
router.get("/dashboard", requireApprovedBusiness, getBusinessDashboard);
router.put(
  "/listings/:listingId/vehicles/:vehicleName/images",
  requireApprovedBusiness,
  updateVehicleImages,
);

export default router;
