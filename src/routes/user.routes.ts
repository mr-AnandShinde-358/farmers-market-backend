import express from "express";
import { validate } from "../middleware/validate.middleware";
import { createUserSchema } from "../schema/user.Schema";
import { registrationUser } from "../controllers/user.controller";

const router = express.Router()

// registration

router.post(
    "/register",
    validate(createUserSchema),
    registrationUser
)
export default router