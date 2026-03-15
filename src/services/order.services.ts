import mongoose from "mongoose";
import { Order, OrderStatus } from "../models/order.model";
import { Product } from "../models/product.model";
import { ApiError } from "../utils/ApiError";
import type { CreateOrderBody } from "../schema/order.schema";

// Create Order

export const createOrder = async (
    buyerId: string,
    data: CreateOrderBody
) => {
    // 1. Product fetch karo

    const product = await Product.findById(data.productId);

    if (!product) throw new ApiError("Product not found", 404);

    if (product.status !== "ACTIVE") {
        throw new ApiError("Product is not available", 400)
    }

    // 2. Enount quantity hai ?

    if (product.quantity < data.quantity) {
        throw new ApiError(
            `Only ${product.quantity} ${product.unit} available`, 400
        )
    }

    // 3. Farmer apana product order nahi kar sakata 

    if (product.farmer.toString() === buyerId) {
        throw new ApiError("You cannot order your own product", 400)
    }

    //4. Total calculate karo
    const totalPrice = product.price * data.quantity;

    // 5. order create karo

    const order = await Order.create({
        buyer: new mongoose.Types.ObjectId(buyerId),
        farmer: product.farmer,
        product: product._id,
        quantity: data.quantity,
        pricePerUnit: product.price,
        totalPrice,
        note: data.note
    })

    return order;
}


// Buyer ke orders

export const getMyOrdersAsBuyer = async (
    buyerId: string,
    page: number = 1,
    limit: number = 10
) => {
    const aggregate = Order.aggregate([
        {
            $match: {
                buyer: new mongoose.Types.ObjectId(buyerId)
            }
        },
        //Product info

        {
            $lookup: {
                from: "products",
                localField: "product",
                foreignField: "_id",
                as: "product",
                pipeline: [
                    {
                        $project: {
                            name: 1,
                            unit: 1,
                            images: {
                                $slice: ["$images"]
                            }
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$product"
        },
        //Farmer info
        {
            $lookup: {
                from: "farmerprofiles",
                localField: "farmer",
                foreignField: "userId",
                as: "farmerProfile",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            "address.district": 1,
                            "address.state": 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: {
                path: "farmerProfile", preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                status: 1,
                quantity: 1,
                pricePerUnit: 1,
                totalPrice: 1,
                note: 1,
                createdAt: 1,
                product: 1,
                farmer: {
                    fullName: "$farmerProfile.fullName",
                    district: "$farmerProfile.address.district",
                    state: "$farmerProfile.address.state",
                },

            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ])
    return await Order.aggregatePaginate(aggregate, { page, limit });
}


// Farmer ke orders

export const getMyOrdersAsFarmer = async (
    farmerId: string,
    page: number = 1,
    limit: number = 10,
    status?: string
) => {
    const matchStage: any = {
        farmer: new mongoose.Types.ObjectId(farmerId)
    };

    if (status) matchStage.status = status

    const aggregate = Order.aggregate([
        {
            $match: matchStage
        },
        {
            $lookup: {
                from: "products",
                localField: "product",
                foreignField: "_id",
                as: "product",
                pipeline: [
                    {
                        $project: {
                            name: 1,
                            unit: 1,
                            images: {
                                $slice: [
                                    "$images", 1
                                ]
                            }
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$product"
        },
        {
            $lookup: {
                from: "buyerprofiles",
                localField: "buyer",
                foreignField: "userId",
                as: "buyerProfile",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            buyerType: 1,
                            "address.district": 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: {
                path: "$buyerProfile",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                status: 1,
                quantity: 1,
                pricePerUnit: 1,
                totalPrice: 1,
                note: 1,
                createdAt: 1,
                product: 1,
                buyer: {
                    fullName: "$buyerProfile.fullName",
                    buyerType: "$buyerProfile.buyerType",
                    district: "$buyerProfile.address.district"
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ])

    return await Order.aggregatePaginate(aggregate, { page, limit })
}

// single order details

export const getOrderById = async (orderId: string, userId: string) => {
    const result = await Order.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(orderId),
                //Sirf buyer ya farmer dekh sakhe apana order
                $or: [
                    {
                        buyer: new mongoose.Types.ObjectId(userId)
                    },
                    {
                        farmer: new mongoose.Types.ObjectId(userId)
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "products",
                localField: "product",
                foreignField: "_id",
                as: "product",
                pipeline: [
                    {
                        $project: {
                            name: 1,
                            unit: 1,
                            images: 1,
                            location: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$product"
        },
        {
            $lookup: {
                from: "farmerprofiles",
                localField: "farmer",
                foreignField: "userId",
                as: "farmerProfile",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            address: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: {
                path: "$farmerProfile",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "buyerprofiles",
                localField: "buyer",
                foreignField: "userId",
                as: "buyerProfile",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            buyerType: 1,
                            address: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: {
                path: "buyerProfile", preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                status: 1,
                quantity: 1,
                pricePerUnit: 1,
                totalPrice: 1,
                note: 1,
                createdAt: 1,
                product: 1,
                farmer: {
                    fullName: "$farmerProfile.fullName",
                    address: "$farmerProfile.address"
                },
                buyer: {
                    fullName: "$buyerProfile.fullName",
                    buyerType: "$buyerProfile.buyerType",
                    address: "$buyerProfile.address"
                }
            }
        }
    ])
    return result[0] ?? null
}


// Order status update

export const updateOrderStatus = async (
    orderId: string,
    userId: string,
    newStatus: string,
    userRole: string
) => {
    const order = await Order.findById(orderId);
    if (!order) throw new ApiError("Order not found", 404)

    // Role based permission check

    if (userRole === "FARMER") {
        if (order.farmer.toString() !== userId) {
            throw new ApiError("Not authorized", 403)
        }


        // Farmer sirf ACCEPT ya REJECT kar sakta hai

        if (!["ACCEPTED", "REJECTED", "COMPLETED"].includes(newStatus)) {
            throw new ApiError("Farmer can only accept, reject or complet", 400)
        }
    }

    if (userRole === "BUYER") {
        if (order.buyer.toString() !== userId) {
            throw new ApiError("Not authorized", 403)
        }

        // Buyer sirf CANCEL kar sakta hai aur sirf pending p

        if (newStatus !== "CANCELLED") {
            throw new ApiError("Buyer can only cancel order", 400)
        }

        if (order.status !== OrderStatus.PENDING) {
            throw new ApiError("Can only cancel pending order", 400);
        }

    }

    order.status = newStatus as OrderStatus

    await order.save();

    return order;
}


// Admin ke liye - all orders 

export const getAllOrders = async (
    page: number = 1,
    limit: number = 10,
    status?: string
) => {

    const matchStage: any = {}

    if (status) matchStage.status = status;

    const aggregate = Order.aggregate([
        {
            $match: matchStage
        },
        {
            $lookup: {
                from: "products",
                localField: "product",
                foreignField: "_id",
                as: "product",
                pipeline: [
                    {
                        $project: {
                            name: 1,
                            unit: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$product"
        },
        {
            $lookup: {
                from: "farmerprofiles",
                localField: "farmer",
                foreignField: "userId",
                as: "farmerProfile",
                pipeline: [
                    {
                        $project: {
                            fullName: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: {
                path: "$farmerProfile",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "buyerprofiles",
                localField: "buyer",
                foreignField: "userId",
                as: "buyerProfile",
                pipeline: [
                    {
                        $project: {
                            fullName: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: {
                path: "$buyerProfile",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                status: 1,
                quantity: 1,
                totalPrice: 1,
                createdAt: 1,
                product: 1,
                farmerName: "$farmerProfile.fullName",
                buyerName: "$buyerProfile.fullName"
            }
        }, {
            $sort: {
                createdAt: -1
            }
        }
    ])

    return await Order.aggregatePaginate(aggregate, { page, limit })
}