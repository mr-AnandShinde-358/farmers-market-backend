import mongoose from "mongoose";
import { User } from "../models/user.model";
import { Product } from "../models/product.model";
import { Order } from "../models/order.model";
import { ApiError } from "../utils/ApiError";


// DashBoard Status
export const getDashboardStates = async ()=>{
    const [userStats,productStats,orderStats] = await Promise.all([

        // Users count by role

        User.aggregate([
            {
                $group:{
                    _id:"$role",
                    count:{
                        $sum:1
                    }
                }
            }
        ]),

        // Total active products
        Product.aggregate([
            {
                $group:{
                    _id:"$status",
                    count:{
                        $sum:1
                    }
                }
            }
        ]),

        // Orders counts by status + total revenue

        Order.aggregate([
            {
                $group:{
                    _id:"$status",
                    count:{
                        $sum:1
                    },
                    totalRevenue:{
                        $sum:"$totalPrice"
                    }
                }
            }
        ]),
    ])

    // Clean format mein return karo 

    const users = {
        farmers:0,
        buyers:0,
        admins:0,
        total:0,
    };

    userStats.forEach((item)=>{
        if(item._id === "FARMER") users.farmers = item.count;

        if(item._id === "BUYER" ) users.buyers = item.count;
        if(item._id === "ADMIN") users.admins = item.count;

        users.total +=item.count
 
    })

    const products = {
        active:0,
        sold_out:0,
        inactive:0,
        total:0,
    }

    productStats.forEach((item)=>{
        if(item._id === "ACTIVE") products.active = item.count;
        if(item._id == "SOLD_OUT") products.sold_out = item.count;
        if(item._id == "INACTIVE") products.inactive = item.count;
        products.total += item.count;
    })


    const orders = {
        pending:0,
        accepted:0,
        completed:0,
        rejected:0,
        cancelled:0,
        total:0,
        totalRevenue:0,
    };


    orderStats.forEach((item)=>{
        if(item._id==="PENDING") orders.pending = item.count;
        if(item._id==='ACCEPTED') orders.accepted = item.count;
        if(item._id === 'COMPLETED') {
            orders.completed = item.count;
            orders.totalRevenue = item.totalRevenue;
        }
        if(item._id === 'REJECTED') orders.rejected = item.count;

        if(item._id ==='CANCELLED') orders.cancelled = item.count;

        orders.total +=item.count;

        return {users,products,orders}

    })

}


// Block/ublock user 

export const toggleBlockUser = async (userId:string)=>{
    const user = await User.findById(userId);
    if(!user) throw new ApiError("user not found",404);

    user.isBlocked = !user.isBlocked;
    await user.save();

    return {
        userId:user._id,
        isBlocked:user.isBlocked,
        message:user.isBlocked ? "User blocked":"User unblocked"
    }

    
}