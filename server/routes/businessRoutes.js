import express from "express";
import { getBusinessDashboard, getMyPartnerStatus } from "../controllers/partnerController.js";
import { requireApprovedBusiness } from "../middleware/business.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.get("/status", getMyPartnerStatus);
router.get("/dashboard", requireApprovedBusiness, getBusinessDashboard);

export default router;
