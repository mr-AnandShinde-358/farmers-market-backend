import { Response,Request } from "express";
import { catchAsync } from "../utils/catchAsync";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import * as adminService from "../services/admin.services";


//GET / api /admin/dashboard

export const getDashboard = catchAsync(
    async(req:Request,res:Response)=>{
        const stats = await adminService.getDashboardStates();
        
        res.json(
            new ApiResponse(200,stats,"Dashboard stats fetched")
        )
    }
)


// PATCH /api/admin/users/:id/block

export const toggleBlockUser = catchAsync(
    async(req:Request,res:Response)=>{
        const result = await adminService.toggleBlockUser(req.params.id!);
        res.json(new ApiResponse(200,result,result.message))
    }
)