import mongoose from "mongoose";
import { Buyer } from "../models/buyerProfileSchema.model";
import { BuyerProfileBody } from "../schema/buyerProfile.schema";


// ─── Create/Update Profile ─────────────────────────────────────
export const upsertBuyerProfile = async (
  userId: string,
  data: BuyerProfileBody
) => {
  return await Buyer.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    {
      $set: {
        ...data,
        isProfileComplete: true,
      },
    },
    { new: true, upsert: true }
  );
};
// Apna profile dekho

export const getMyBuyerProfile = async (userId: string) => {
  const result = await Buyer.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userInfo",
        pipeline: [
          {
            $project: {
              email: 1,
              phone: 1,
              isVerified: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$userInfo",
    },
    {
      $project: {
        fullName: 1,
        buyerType: 1,
        phoneNumber2: 1,
        address: 1,
        isProfileComplete: 1,
        createdAt: 1,
        email: "$userInfo.email",
        phone: "$userInfo.phone",
        isVerified: "$userInfo.isVerified",
      },
    },
  ]);
  return result[0] ?? null;
};

// Admin ke liye - all buyers paginated

export const getAllBuyers = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
) => {
  const matchStage: any = {};

  if (search) {
    matchStage.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { "address.district": { $regex: search, $options: "i" } },
      { "address.state": { $regex: search, $options: "i" } },
    ];
  }
  const aggregate = Buyer.aggregate([
    {
      $match: matchStage,
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userInfo",
        pipeline: [
          {
            $project: {
              email: 1,
              phone: 1,
              isVerified: 1,
              isBlocked: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$userInfo",
    },
    {
      $project: {
        fullName: 1,
        buyerType: 1,
        address: 1,
        isProfileComplete: 1,
        createdAt: 1,
        email: "$userInfo.email",
        phone: "$userInfo.phone",
        isVerified: "$userInfo.isVerified",
        isBlocked: "$userInfo.isBlocked",
      },
    },
    { $sort: { createdAt: -1 } },
  ]);
  return await Buyer.aggregatePaginate(aggregate, { page, limit });
};
