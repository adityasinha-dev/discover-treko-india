import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID, timingSafeEqual } from "node:crypto";

let configuredPasswordHash;

function safeStringEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  const length = Math.max(leftBuffer.length, rightBuffer.length, 1);
  const paddedLeft = Buffer.alloc(length);
  const paddedRight = Buffer.alloc(length);
  leftBuffer.copy(paddedLeft);
  rightBuffer.copy(paddedRight);
  const equal = timingSafeEqual(paddedLeft, paddedRight);
  return equal && leftBuffer.length === rightBuffer.length;
}

async function getConfiguredPasswordHash(password) {
  if (!configuredPasswordHash) {
    configuredPasswordHash = await bcrypt.hash(password, 12);
  }
  return configuredPasswordHash;
}

export const loginAdmin = async (req, res, next) => {
  try {
    const adminId = process.env.ADMIN_ID;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminId || !adminPassword || !process.env.JWT_SECRET) {
      return res.status(503).json({ message: "Admin sign-in is temporarily unavailable." });
    }

    const submittedId = typeof req.body?.adminId === "string" ? req.body.adminId : "";
    const submittedPassword = typeof req.body?.password === "string" ? req.body.password : "";
    if (submittedId.length > 256 || submittedPassword.length > 1024) {
      return res.status(401).json({ message: "Invalid admin ID or password." });
    }
    const passwordHash = await getConfiguredPasswordHash(adminPassword);
    const [validId, validPassword] = await Promise.all([
      Promise.resolve(safeStringEqual(submittedId, adminId)),
      bcrypt.compare(submittedPassword, passwordHash),
    ]);

    if (!validId || !validPassword) {
      return res.status(401).json({ message: "Invalid admin ID or password." });
    }

    const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
      expiresIn: "1h",
      jwtid: randomUUID(),
    });

    return res.status(200).json({ token, expiresIn: 3600 });
  } catch (error) {
    return next(error);
  }
};
