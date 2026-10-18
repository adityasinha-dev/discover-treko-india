import jwt from "jsonwebtoken";
import PartnerApplication from "../models/PartnerApplication.js";

const revokedAdminTokens = new Map();

export const requireApprovedBusiness = async (req, res, next) => {
  try {
    const application = await PartnerApplication.findOne({ ownerId: req.user._id });

    if (!application) {
      return res
        .status(404)
        .json({ message: "No business application was found for this account." });
    }

    if (application.status !== "approved") {
      return res.status(403).json({
        message: `Business access is unavailable while your application is ${application.status}.`,
        status: application.status,
      });
    }

    req.business = application;
    return next();
  } catch (error) {
    return next(error);
  }
};

export const requireAdmin = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer ") || !process.env.JWT_SECRET || !process.env.ADMIN_ID) {
    return res.status(401).json({ message: "Admin authentication is required." });
  }

  try {
    const token = authorization.slice("Bearer ".length);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (
      !decoded ||
      typeof decoded !== "object" ||
      decoded.role !== "admin" ||
      typeof decoded.jti !== "string"
    ) {
      return res.status(403).json({ message: "Admin access is required." });
    }
    if (revokedAdminTokens.has(decoded.jti)) {
      return res.status(401).json({ message: "Admin authentication is invalid or expired." });
    }
    req.admin = { id: "admin", tokenId: decoded.jti, expiresAt: decoded.exp };
    for (const [tokenId, expiresAt] of revokedAdminTokens) {
      if (expiresAt <= Date.now()) revokedAdminTokens.delete(tokenId);
    }
    return next();
  } catch {
    return res.status(401).json({ message: "Admin authentication is invalid or expired." });
  }
};

export const revokeAdminToken = (tokenId, expiresAt) => {
  if (typeof tokenId === "string" && Number.isFinite(expiresAt)) {
    revokedAdminTokens.set(tokenId, expiresAt * 1000);
  }
};
