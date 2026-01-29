import  { Iuser } from "../models/user.model";
import { catchAsync } from "../utils/catchAsync";
import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import * as userService from "../services/user.services";
import { sendToken } from "../utils/sendJwtToken";

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

export interface ILoginUser {
  email:string;
  password:string;
}

export const loginUser = catchAsync(
  async (req:Request,res:Response)=>{
    
    

    // Service handle logic
    const userData =req.body as ILoginUser
  

    const user = await userService.loginUser(userData)

  

    // Utility handle response and cookies

    await sendToken(user,200,res)
  }
)


