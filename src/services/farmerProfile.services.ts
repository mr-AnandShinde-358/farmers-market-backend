import mongoose from "mongoose";
import { Farmer } from "../models/farmerProfile.model";
import { FarmerProfileBody } from "../schema/farmerProfile.schema";
import { Order } from "../models/order.model";
import { Product } from "../models/product.model";

// Create/Update Profile
//upsert- if exist then update else create

export const upsertFarmerProfile = async (
    userId:string,
    data:FarmerProfileBody
)=>{

    const profile = await Farmer.findOneAndUpdate(
        {userId:new mongoose.Types.ObjectId(userId)},
        {
            $set:{
                ...data,
                isProfileComplete:true
            },
        },
        {
            new:true,
            upsert:true
        }
    );
    return profile;
}

// Apna profile dekho

export const getMyFarmerProfile = async(userId:string)=>{
    const result = await Farmer.aggregate([
      {
        $match:{
            userId: new mongoose.Types.ObjectId(userId),
        }
      },
      // user model se email + phone join 
      {
        
            $lookup:{
                from:"users",
                localField:"userId",
                foreignField:"_id",
                as:"userInfo",
                pipeline:[
                    {
                        $project:{
                            email:1,
                            phone:1,
                            isVerified:1
                        }
                    }
                ]
            }
        
      },
      {
        $unwind:"$userInfo"
      },
      {
        $project:{
            fullName:1,
            phoneNumber2:1,
            address:1,
            isProfileComplete:1,
            createdAt:1,
            email:"$userInfo.email",
            phone:"$userInfo.phone",
            isVerified:"$userInfo.isVerified"
        }
      }
    ]);
    return result[0]??null
}


// Admin ke liye - all farmers paginated

export const getAllFarmers = async (
    page:number=1,
    limit:number=10,
    search?:string
)=>{
    const matchStage:any ={}

    if(search){
        matchStage.$or=[
            {
                fullName:{
                    $regex:search,
                    $options:"i"
                }
            }
        ]
    }

    const aggregate = Farmer.aggregate([
        {
            $match:matchStage
        },
        {
            $lookup:{
                from:"users",
                localField:"userId",
                foreignField:"_id",
                as:"userInfo",
                pipeline:[
                    {
                        $project:{
                            email:1,
                            phone:1,
                            isVerified:1,
                            isBlocked:1
                        }
                    }
                ]
            }
        },
        {
            $unwind:"$userInfo"
        },
        {
            $project:{
                fullName:1,
                address:1,
                isProfileComplete:1,
                createdAt:1,
                email:"$userInfo.email",
                phone: "$userInfo.phone",
                isVerified: "$userInfo.isVerified",
                isBlocked: "$userInfo.isBlocked",
            },
        },
        {
            $sort:{
                createdAt:1
            }
        }
    ])

    return await Farmer.aggregatePaginate(aggregate,{page,limit})
}


// farmer dashboard stats

export const getFarmerDashboard = async (farmerId:string)=>{
    const farmerObjectId = new mongoose.Types.ObjectId(farmerId)

    const [orderStats,productStats] = await Promise.all([
        // orders stats

        Order.aggregate([
            {
                $match:{
                    farmer:farmerObjectId;
                }
            },
            {
                $group:{
                    _id:"$status",
                    count:{
                        $sum:1,
                    },
                    revenue:{
                        $sum:"$totalPrice"
                    }
                },
            }
        ]),

        // product stats

        Product.aggregate([
            {
                $match:{
                    farmer:farmerObjectId
                }
            },
            {
                $group:{
                    _id:"$status",
                    count:{
                        $sum:1
                    }
                }
            }
        ])

    ]);

    // Orders clean format 

    const orders = {
        pending:0,
        accepted:0,
        completed:0,
        rejected:0,
        cancelled:0,
        total:0,
        totalRevenue:0
    }

    orderStats.forEach((item) => {
    if (item._id === "PENDING") orders.pending = item.count;
    if (item._id === "ACCEPTED") orders.accepted = item.count;
    if (item._id === "COMPLETED") {
      orders.completed = item.count;
      orders.totalRevenue = item.revenue;
    }
    if (item._id === "REJECTED") orders.rejected = item.count;
    if (item._id === "CANCELLED") orders.cancelled = item.count;
    orders.total += item.count;
  });

  // Products clean format
  const products = {
    active: 0,
    sold_out: 0,
    inactive: 0,
    total: 0,
  };

  productStats.forEach((item) => {
    if (item._id === "ACTIVE") products.active = item.count;
    if (item._id === "SOLD_OUT") products.sold_out = item.count;
    if (item._id === "INACTIVE") products.inactive = item.count;
    products.total += item.count;
  });

  return { orders, products };

}