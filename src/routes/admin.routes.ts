import {Router} from "express"
import * as adminController from "../controllers/admin.controller";
import { isAuthenticated } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/authorizeRoles.middleware";
import { UserRole } from "../models/user.model";


const router = Router();

// sab admin routes protected 

router.use(isAuthenticated,authorizeRoles(UserRole.ADMIN))

router.get("/dashboard",adminController.getDashboard)
router.patch("/users/:id/block",adminController.toggleBlockUser)

export default router;
