import mongoose from "mongoose";
import type { Document,Model,Schema } from "mongoose";
import { IAddress } from "./farmerProfile.model";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


export interface Ibuyer extends Document{
    userId:mongoose.Types.ObjectId;
    fullName:string;
    buyerType:'Individual'|'Wholesaler'|'Retailer'|'Processor';
    phoneNumbe2:string;
    address:IAddress;
    isVerified:boolean;
    isProfileComplete: boolean;
    createdAt:Date;
    updatedAt:Date;
}

export interface IBuyerModel extends Model<Ibuyer>{
    aggregatePaginate:any
}


const buyerSchema:Schema<Ibuyer> = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    fullName:{
        type:String,
        required:true,
        trim:true
    },
    buyerType:{
        type:String,
        enum: ['Individual','Wholesaler','Retailer','Processor'],
        default:'Individual'
    },
    phoneNumbe2:{
        type:String,
        required:false,
        unique:true
    },
    address:{
        village:String,
        district:String,
        state:String,
        pincode:Number,
     
    },
      isProfileComplete: {
      type: Boolean,
      default: false,
    }
    
},{timestamps:true})



buyerSchema.plugin(mongooseAggregatePaginate)





export const Buyer = (
    mongoose.models.Buyer || mongoose.model<Ibuyer,IBuyerModel>("Buyer",buyerSchema)
) as IBuyerModel