import { catchAsync } from "../utils/catchAsync";
import { Request,Response,NextFunction } from "express";
import { AuthenticatedRequest } from "../types/auth.interface";
import { ApiError } from "../utils/ApiError";
import { FarmerProfileBody, farmerProfileSchema } from "../schema/farmerProfile.schema";
import * as farmerService from "../services/farmerProfile.services"
import { ApiResponse } from "../utils/ApiResponse";
//1. farmer profile completed 
// 2. delete profile


//POST/PATCH/api/farmer/profile

export const upsertProfile = catchAsync(
    async(req:Request,res:Response)=>{
        // const authReq = req as AuthenticatedRequest; // ← andar cast
       
        const profile = await farmerService.upsertFarmerProfile(
            req.user!._id.toString(),
            { body: req.body } as FarmerProfileBody
        )

        res.status(200).json(new ApiResponse(200,profile,"Profile updated"))
    }
)


// GET/api/farmer/profile

export const getMyProfile = catchAsync(
    async(req:Request,res:Response)=>{
        //  const authReq = req as AuthenticatedRequest; 
        const profile = await farmerService.getMyFarmerProfile(
            req.user!._id.toString()
        )

        if(!profile) throw new ApiError("Profile not found",404);

        res.json(new ApiResponse(200,profile,"Profile fetched"))
    }
)


//GET /api/farmer/all - Admin only

export const getAllFarmers = catchAsync(
    async(req:Request,res:Response)=>{
        const page= Number(req.query.page)||1;
        const limit = Number(req.query.limit);
        const search = req.query.search as string;

        const farmers = await farmerService.getAllFarmers(page,limit,search)

        res.json(new ApiResponse(200,farmers,"Farmers Fetched"))
    }
)


export const getFarmerDashboard = catchAsync(
  async (req: Request, res: Response) => {

    const stats = await farmerService.getFarmerDashboard(
      req.user!._id.toString()
    );
    res.json(new ApiResponse(200, stats, "Dashboard fetched"));
  }
);
