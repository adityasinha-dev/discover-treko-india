import express from "express";
import { createBooking } from "../controllers/partnerController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createBooking);

export default router;
