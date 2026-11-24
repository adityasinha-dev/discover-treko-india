import express from "express";
import {
  getPublicPartnerListings,
  loginPartner,
  registerPartner,
  submitPartnerApplication,
} from "../controllers/partnerController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", registerPartner);
router.post("/login", loginPartner);
router.get("/public/listings", getPublicPartnerListings);
router.use(protect);
router.post("/", submitPartnerApplication);

export default router;
