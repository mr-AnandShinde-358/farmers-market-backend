import { Request,Response,NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";
import { catchAsync } from "../utils/catchAsync";
import UserModel from "../models/user.model"

export const isAuthenticated = catchAsync(
    async(req:Request,res:Response,next:NextFunction)=>{
        //1 get token

        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer","");

        if(!token){
            throw new ApiError("Please login to access this resource",401);
        }

        // 2. Token verify karo
        const decodedData:any = jwt.verify(token,process.env.ACCESS_TOKEN_SECRETE as string);

        // 3. User ko request main attach karo

        const user = await UserModel.findById(decodedData._id);

        if(!user){
            throw new ApiError("User not found",404)
        }
        req.user = user;
        next()
    }
)