import { Request,Response,NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { UserRole } from "../models/user.model";


// ye function roles ki list array lega 

export const authorizeRoles = (...allwedRoles:UserRole[])=>{
    return (req:Request,res:Response,next:NextFunction)=>{

        //1. check if user is loggedin (authenticated middleware se req.user milta hai)

        if(!req.user){
            throw new ApiError("Login required to access this resource",401);
        }

        // check if user's role is in the allowedRoles list

        if(!allwedRoles.includes(req.user.role as UserRole)){
            throw new ApiError(`Role: ${req.user.role} is not authorized to access this resource`,403)
        }
        
        // sab sahi hai , toh aage badho access do 
        next()
    }

}