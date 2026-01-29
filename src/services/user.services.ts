import { NextFunction } from "express";
import UserModel, { Iuser } from "../models/user.model";

import { ApiError } from "../utils/ApiError";
import { IRegistrationBody } from "../controllers/user.controller";


export const createUser = async (userData: IRegistrationBody): Promise<Iuser> => {
  
    const { email, phone, password } = userData 
    // 1. Business Logic: Check if user exists
    const existedUser = await UserModel.findOne({
      $or: [{ email }, { phone }],
    });

    if (existedUser) {
      throw new ApiError("User with email or phone already exists", 409);
    }

    // 2. Database Operation: Create user
    const user = await UserModel.create({ email, password, phone });

    // 3. Sensitive data cleanup
    const createdUser = await UserModel.findById(user._id).select("-password");

    if (!createdUser) {
      throw new ApiError(
        "Something went wrong while registering the user",
        500,
      );
    }

    return createdUser as Iuser;
 
};
