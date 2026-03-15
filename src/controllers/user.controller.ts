import  { IUser, UserRole } from "../models/user.model";
import { catchAsync } from "../utils/catchAsync";
import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import * as userService from "../services/user.services";
import { cookiesOptions, sendToken } from "../utils/sendJwtToken";
import { ApiError } from "../utils/ApiError";
import { AuthenticatedRequest } from "../types/auth.interface";
import { json } from "zod";

export interface IRegistrationBody {
  email: string;
  password: string;
  phone: string;
  role:UserRole;
}


export const registrationUser = catchAsync(
  async(req:Request,res:Response,next:NextFunction)=>{
    console.log("ROLE RECEIVED:", req.body.role);
    const userData = req.body as IRegistrationBody;

    // services ko call kiya logic hanlde karne ke liye
    
    console.log("user Data befor service",userData,req.body)

    const newUser = await userService.createUser(userData);

    // sirf response bheja

    res.status(201).json(
      new ApiResponse<IUser>(201,newUser,"Account created successfully")
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
  
    console.log("before calling login",userData)
    const user = await userService.loginUser(userData)

  

    // Utility handle response and cookies

    await sendToken(user,200,res)
  }
)


export const logout = catchAsync(async (req: 
Request, res: Response) => {
    // const authReq = req as AuthenticatedRequest;
  const userId = req.user!._id;

  if (!userId) {
    throw new ApiError("User not found in request", 401);
  }

  // 1. Database se token uda diya
  await userService.logoutUser(userId.toString());

  // 2. Browser/App se cookies clear kar di
  // Note: clearCookie ke waqt maxAge ki zarurat nahi hoti, bas options match karne chahiye
  res
    .status(200)
    .clearCookie("accessToken", cookiesOptions) 
    .clearCookie("refreshToken", cookiesOptions)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

export const updateAccessToken = catchAsync(async(req:Request,res:Response)=>{
// 1. Get token from cookie(Web) Or body (Mobile)
//  const authReq = req as AuthenticatedRequest;

const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

if(!incomingRefreshToken){
  throw new ApiError("Refresh token is required",401)
}

// 2 Call Service
const {user,accessToken,newRefreshToken} = await userService.refreshAccessToken(incomingRefreshToken)

// 3. Set Cookies (For Web Admin)
res.cookie("accessToken",accessToken,{...cookiesOptions,maxAge:1 * 24 * 60 * 60 * 1000});
res.cookie("refreshToken",newRefreshToken,{...cookiesOptions,maxAge:7 * 24 * 60 * 60 * 1000})

//4. Send Response (For Mobile App)

return res.status(200).json(
  new ApiResponse(200,{
    accessToken,
    refreshToken:newRefreshToken,
    user
  },
  "Access token refreshed successfully"
)
)
})

// get user Information

export const getUserInfo = catchAsync(async(req:Request,res:Response)=>{
// const authReq = req as AuthenticatedRequest; // ← 
  const user = await userService.getUserInfo(req.user!._id.toString())

  res.status(200).json(
    new ApiResponse(200,{user},"User Detailes fetch successfully")
  )
})

//forgot-password
export const forgotPassword = catchAsync(async(req:Request,res:Response)=>{
  // 1. get email
  // 2. check account exits or not
  // 3. generate otp
  // 
  // 3. send reset-password email
  // 4. redirect to reset-password route
})

// Reset-password