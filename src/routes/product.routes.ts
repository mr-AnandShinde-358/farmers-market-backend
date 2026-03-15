import { Router , RequestHandler} from "express";
import * as productController from "../controllers/product.controller";
import { isAuthenticated } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/authorizeRoles.middleware";
import { UserRole } from "../models/user.model";

const router = Router();

// Public

router.get("/",productController.getAllProducts);
router.get("/:id",productController.getProduct);

//Farmer only

const farmerMiddleware = [isAuthenticated, authorizeRoles(UserRole.FARMER)] as RequestHandler[];;

router.post("/", farmerMiddleware, productController.createProductController);
router.get("/my/listings", farmerMiddleware, productController.getMyProducts);
router.patch("/:id", farmerMiddleware, productController.updateProductController);
router.delete("/:id", farmerMiddleware, productController.deleteProductController);
export default router;