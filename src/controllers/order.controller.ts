import { Response,Request } from "express";
import { catchAsync } from "../utils/catchAsync";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { AuthenticatedRequest } from "../types/auth.interface";
import {
    CreateOrderBody,
    createOrderSchema,
    updateOrderStatusSchema
} from "../schema/order.schema"

import * as orderService from "../services/order.services"


//Post /api/orders - Buyer creates order

export const createOrder = catchAsync(
    async(req:Request,res:Response)=>{
    //    const authReq = req as unknown as AuthenticatedRequest;
        const order = await orderService.createOrder(
            req.user!._id.toString(),
           req.body as CreateOrderBody
        )

        res.status(201).json(new ApiResponse(201,order,"Order Placed"))
    }
)


// Get /api/orders/my - Buyer ya farmer apne orders dekhe

export const getMyOrders = catchAsync(
    async(req:Request,res:Response)=>{
        const page=Number(req.query.page)||1;
        const limit = Number(req.query.limit)||10;
        const status = req.query.status as string;;

        let orders;
        if(!req.user) throw new ApiError("user not found",404)
        if(req.user.role === 'FARMER'){
            orders = await orderService.getMyOrdersAsFarmer(
                req.user._id.toString(),
                page,
                limit,
                status
            )
        }else if(req.user.role === 'BUYER'){
            orders = await orderService.getMyOrdersAsBuyer(
                req.user._id.toString(),
                page,
                limit
            )
        }

        res.json(
            new ApiResponse(200,orders,"Orders fetched")
        )
    }
)


// GET /api/orders/:id - Single order details

export const getOrder = catchAsync(
    async (req:Request,res:Response)=>{
     
        const order = await orderService.getOrderById(
            req.params.id!,
            req.user!._id.toString()
        )

        if(!order) throw new ApiError("Order not found",404)
        res.json(new ApiResponse(200,order,"Order fetched"))
    }
)


//Patch /api/orders/:id/status - status update

export const updateOrderStatus = catchAsync(
    async(req:Request,res:Response)=>{
        if(!req.user) throw new ApiError("user not found",404)
      
        const order = await orderService.updateOrderStatus(
            req.params.id!,
            req.user._id.toString(),
            req.body,
            req.user.role
        )

        res.json(
            new ApiResponse(
                200,
                order,
                "Order status updated"
            )
        )
    }
)


// GET /api/orders/all - Admin only

export const getAllOrders  = catchAsync(
    async(req:Request,res:Response)=>{
        const page= Number(req.query.page)||1;
        const limit = Number(req.query.limit)||10;

        const status = req.query.status as string;

        const orders = await orderService.getAllOrders(page,limit,status)

        res.json(
            new ApiResponse(200,orders,"order fetched")
        )


    }
)