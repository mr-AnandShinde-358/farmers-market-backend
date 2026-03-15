import {Router} from "express"
import * as orderController from "../controllers/order.controller"
import { isAuthenticated } from "../middleware/auth.middleware"
import { authorizeRoles } from "../middleware/authorizeRoles.middleware"
import { UserRole } from "../models/user.model"

const router = Router();

// BUYER+FARMER

router.get("/my",isAuthenticated,orderController.getMyOrders)
router.get("/:id",isAuthenticated,orderController.getOrder)
router.patch("/:id/status",isAuthenticated,orderController.updateOrderStatus)

// Buyer only

router.post("/",isAuthenticated,authorizeRoles(UserRole.BUYER),orderController.createOrder)

// Admin only

router.get(
    "/all",
    authorizeRoles(UserRole.ADMIN),
    orderController.getAllOrders
)

export default router;