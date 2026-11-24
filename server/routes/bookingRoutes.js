import express from "express";
import { createBooking, getMyBookings } from "../controllers/partnerController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/mine", protect, getMyBookings);
router.post("/", protect, createBooking);

export default router;
