import express from "express";
import { validate } from "../middleware/validate.middleware";
import { createUserSchema, loginUserSchema } from "../schema/user.Schema";
import { loginUser, registrationUser } from "../controllers/user.controller";

const router = express.Router()

// registration

router.post(
    "/register",
    validate(createUserSchema),
    registrationUser
)

router.post(
    "/loginUser",validate(loginUserSchema),
    loginUser
)
export default router