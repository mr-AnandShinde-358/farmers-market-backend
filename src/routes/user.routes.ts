import express from "express";
import { validate } from "../middleware/validate.middleware";
import { createUserSchema, loginUserSchema } from "../schema/user.Schema";
import { getUserInfo, loginUser, logout, registrationUser, updateAccessToken } from "../controllers/user.controller";
import { isAuthenticated } from "../middleware/auth.middleware";

const router = express.Router()

// registration

router.post(
    "/register",
    validate(createUserSchema),
    registrationUser
)

router.post(
    "/login",validate(loginUserSchema),
    loginUser
)

router.post("/logout",isAuthenticated,logout)
router.post("/refresh",isAuthenticated,updateAccessToken)
router.get("/me",isAuthenticated,getUserInfo)
export default router