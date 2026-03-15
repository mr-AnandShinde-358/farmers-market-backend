import { catchAsync } from "../utils/catchAsync";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { AuthenticatedRequest } from "../types/auth.interface";
import { BuyerProfileBody, buyerProfileSchema } from "../schema/buyerProfile.schema";
import * as buyerService from "../services/buyerProfile.services";
import { Request,Response } from "express";


// POST /api/buyer/profile
export const upsertProfile = catchAsync(
  async (req: Request, res: Response) => {
    
    // const authReq = req as unknown as AuthenticatedRequest; // ← andar cast
    
    const profile = await buyerService.upsertBuyerProfile(
      req.user!._id.toString(),
      { body: req.body } as BuyerProfileBody
    );

    res.status(200).json(new ApiResponse(200, profile, "Profile updated"));
  }
);


// / GET /api/buyer/profile
export const getMyProfile = catchAsync(
  async (req: Request, res: Response) => {
    //  const authReq = req as unknown as AuthenticatedRequest; // ← andar cast
    

    const profile = await buyerService.getMyBuyerProfile(
      req.user!._id.toString()
    );

    if (!profile) throw new ApiError("Profile not found", 404);

    res.json(new ApiResponse(200, profile, "Profile fetched"));
  }
);

// GET /api/buyer/all — Admin only
export const getAllBuyers = catchAsync(
  async (req:Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search as string;

    const buyers = await buyerService.getAllBuyers(page, limit, search);

    res.json(new ApiResponse(200, buyers, "Buyers fetched"));
  }
);