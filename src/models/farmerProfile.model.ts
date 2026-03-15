import mongoose from "mongoose";
import type { Document,Model,Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

export interface IAddress {
    village:string;
    district:string;
    state:string;
    pincode:number;
}

export interface Ifarmer extends Document{
    userId:mongoose.Types.ObjectId;
    fullName:string;
    phoneNumber2?:string;
    address:IAddress;
    isProfileComplete: boolean;
    createdAt:Date;
    updatedAt:Date;
}


export interface IfarmerModel extends Model<Ifarmer> {
    aggregatePaginate: any;
}

const farmerSchema:Schema<Ifarmer> = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    fullName:{
        type:String,
        required:true
    },
    phoneNumber2:{
        type:String,
        required:false
    },
    isProfileComplete:{
        type:Boolean,
        default:false
    },
    address:{
        village:String,
        district:String,
        state:String,
        pincode:Number,
    }


},{timestamps:true})


//Schema ke baad , model se pahle

farmerSchema.plugin(mongooseAggregatePaginate);





export const Farmer = (
    mongoose.models.Farmer || mongoose.model<Ifarmer,IfarmerModel>("Farmer",farmerSchema)
) as IfarmerModel