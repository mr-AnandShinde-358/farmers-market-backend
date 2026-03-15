import { Router } from "express";
import * as buyerController from "../controllers/buyerProfile.controller";
import { authorizeRoles } from "../middleware/authorizeRoles.middleware";
import { UserRole } from "../models/user.model";
import { isAuthenticated } from "../middleware/auth.middleware";

const router = Router();



// ─── Buyer routes ──────────────────────────────────────────────
router.get(
  "/profile",
  isAuthenticated,
  authorizeRoles(UserRole.BUYER),
  buyerController.getMyProfile 
);

router.post(
  "/profile",
  isAuthenticated,
  authorizeRoles(UserRole.BUYER),
  buyerController.upsertProfile 
);

// ─── Admin routes ──────────────────────────────────────────────
router.get(
  "/all",
  isAuthenticated,
  authorizeRoles(UserRole.ADMIN),
  buyerController.getAllBuyers 
);

export default router;