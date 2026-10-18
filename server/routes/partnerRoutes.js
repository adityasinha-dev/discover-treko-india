import express from "express";
import { submitPartnerApplication } from "../controllers/partnerController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.post("/", submitPartnerApplication);

export default router;
