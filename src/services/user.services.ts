import { NextFunction } from "express";
import  { IUser,User } from "../models/user.model";
import jwt,{ JwtPayload } from "jsonwebtoken";

import { ApiError } from "../utils/ApiError";
import { ILoginUser, IRegistrationBody } from "../controllers/user.controller";


export const createUser = async (userData: IRegistrationBody): Promise<IUser> => {
  
    const { email, phone, password,role } = userData 
    // 1. Business Logic: Check if user exists
    console.log("calling call")
    console.log('userrole',role)
    const existedUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existedUser) {
      throw new ApiError("User with email or phone already exists", 409);
    }

    // 2. Database Operation: Create user
    const user = await User.create({ email, password, phone,role });

    // 3. Sensitive data cleanup
    const createdUser = await User.findById(user._id).select("-password");

    if (!createdUser) {
      throw new ApiError(
        "Something went wrong while registering the user",
        500,
      );
    }

    return createdUser as IUser;
 
};


export const loginUser = async(userData:ILoginUser): Promise<IUser>=>{
    const {email,password} = userData;
    
    const user = await User.findOne({email}).select("+password")
   

    if(!user){
      throw new ApiError("Invalid email or password",401)
    }

    const isPasswordMatch = await user.comparePassword(password)

    if(!isPasswordMatch){
      throw new ApiError("Invalid email or password",401)
    }

    return user;

}



export const logoutUser = async (userId: string) => {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $unset: { refreshToken: 1 } // Refresh token ko completely delete kar dega field se
    },
    { new: true }
  );
  
  if (!user) {
    throw new ApiError("User not found during logout", 404);
  }
  
  return user;
};


export const refreshAccessToken = async(incomingRefreshToken:string)=>{
  try {
    //1 Verify token
    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as JwtPayload;
    if(!decoded){
      throw new ApiError("invalid refresh token",401)
    }
    //2 Find User

    const user = await User.findById(decoded?._id)

    if(!user){
      throw new ApiError("Invalid refresh token",401)
    }
    //3. Security check : check incoming token and db token are same or not

    if(incomingRefreshToken === user.refreshToken){
      throw new ApiError("Invalid refresh token",401)
    }
    //4. Generate new Tokens
    const accessToken =  user.generateAccessToken();
    const newRefreshToken =  user.generateRefreshToken();
    // 5. Update DB with new refresh Token
    user.refreshToken = newRefreshToken;
    await user.save({validateBeforeSave:false})
    //6. return user,accessToken,newRefreshToken

    return {accessToken,newRefreshToken,user}
  } catch (error) {
    throw new ApiError("Invalid or expired refresh token",401)
  }
}

export const getUserInfo = async(userId:string)=>{
 const user = await User.findById(userId)

 return user
}