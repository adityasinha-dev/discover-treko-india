import express from "express";
import {
  listPartnerApplications,
  reviewPartnerApplication,
} from "../controllers/partnerController.js";
import { requireAdmin, revokeAdminToken } from "../middleware/business.js";
import { loginAdmin } from "../controllers/adminController.js";
import { createAdminLoginRateLimit } from "../middleware/adminLoginRateLimit.js";

const router = express.Router();

router.post("/login", createAdminLoginRateLimit(), loginAdmin);
router.use(requireAdmin);
router.post("/logout", (req, res) => {
  revokeAdminToken(req.admin.tokenId, req.admin.expiresAt);
  return res.status(200).json({ message: "Admin session ended." });
});
router.get("/partners", listPartnerApplications);
router.patch("/partners/:applicationId/status", reviewPartnerApplication);

export default router;
