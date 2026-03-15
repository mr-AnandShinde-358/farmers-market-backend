import mongoose from "mongoose";
import type { Document,Model,Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


export enum OrderStatus {
    PENDING = "PENDING", // BUYER NE REQUEST BHEJA 
    ACCEPTED = "ACCEPTED", // FARMER NE ACCEPT KIYA
    REJECTED = "REJECTED", // FARMER NE REJECT KIYA
    COMPLETED = "COMPLETED", // DELIVERY HO GAYI
    CANCELLED = "CANCELLED", // BUYER NE CANCEL KIYA 
}

export interface IOrder extends Document {
    buyer:mongoose.Types.ObjectId;
    farmer:mongoose.Types.ObjectId;
    product:mongoose.Types.ObjectId;
    quantity:number;
    pricePerUnit:number; // Order ke time ka price (baad mein price change ho sakata hai)
    totalPrice:number;
    status:OrderStatus;
    note?:string; // Buyer ka optional message to farmer
    createdAt:Date;
    updatedAt:Date;
}


export interface IOrderModel extends Model<IOrder> {
  aggregatePaginate: any;
}

const orderSchema:Schema<IOrder> = new mongoose.Schema({
    buyer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    farmer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product",
        required:true
    },
    quantity:{
        type:Number,
        required:true,
        min:1
    },
    pricePerUnit:{
        type:Number,
        required:true
    },
    totalPrice:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        enum:Object.values(OrderStatus),
        default:OrderStatus.PENDING
    },
    note:{
        type:String,
        trim:true,
    }
},{
    timestamps:true
})


orderSchema.plugin(mongooseAggregatePaginate);

export const Order = (
  mongoose.models.Order ||
  mongoose.model<IOrder, IOrderModel>("Order", orderSchema)
) as IOrderModel;
