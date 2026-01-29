import UserModel, { Iuser } from "../models/user.model";
import { catchAsync } from "../utils/catchAsync";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import * as userService from "../services/user.services";

export interface IRegistrationBody {
  email: string;
  password: string;
  phone: string;
}


export const registrationUser = catchAsync(
  async(req:Request,res:Response,next:NextFunction)=>{
    const userData = req.body as IRegistrationBody;

    // services ko call kiya logic hanlde karne ke liye 

    const newUser = await userService.createUser(userData);

    // sirf response bheja

    res.status(201).json(
      new ApiResponse<Iuser>(201,newUser,"Account created successfully")
    )
  }
)


