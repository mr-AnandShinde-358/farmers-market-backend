import { Router } from "express";
import * as farmerController from "../controllers/farmerProfile.controller";

import { isAuthenticated } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/authorizeRoles.middleware";
import { UserRole } from "../models/user.model";

const router = Router();

router.get("/profile",isAuthenticated,authorizeRoles(UserRole.FARMER),farmerController.getMyProfile)

router.post("/profile",
    isAuthenticated,
    authorizeRoles(UserRole.FARMER),
    farmerController.upsertProfile
)


// Admin routes

router.get(
    "/all",
    isAuthenticated,
    authorizeRoles(UserRole.ADMIN),
    farmerController.getAllFarmers
)

router.get(
  "/dashboard",
  isAuthenticated,
  authorizeRoles(UserRole.FARMER),
  farmerController.getFarmerDashboard
);


export default router;