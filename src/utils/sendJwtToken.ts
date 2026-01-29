import { Response } from "express";

import { Iuser } from "../models/user.model";


export const cookiesOptions:any ={
    httpOnly:true,
    secure:process.env.NODE_ENV ==="production",
    sameSite:"none",
    path:"/"
};

export const sendToken = async (user:Iuser,statusCode:number,res:Response)=>{
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token in DB for session management
    user.refreshToken = refreshToken;

    await user.save({validateBeforeSave:false})
    
    // Cookie Expiry (Example:15m for access,7d for refresh)
    const accessTokenExpire = 15*60*1000;
    const refreshTokenExpire = 7*24*60*60*1000;

    res.cookie("accessToken",accessToken,{
        ...cookiesOptions,
        maxAge:accessTokenExpire
    });
    res.cookie("refreshToken",refreshToken,{
        ...cookiesOptions,
        maxAge:refreshTokenExpire
    })

    // Remove sensitive data befor sendong
    const userData = user.toObject();
    delete userData.password;
    // delete userData.refreshToken; // this for mobile

    res.status(statusCode).json({
        success:true,
        user:userData,
        accessToken, //Mobile app ise AsyncStorage main save karega
        refreshToken // Mobile app ise SecureStore mein save karega
    })
}