import mongoose from "mongoose";
import type { Document,Model,Schema } from "mongoose";
import { IAddress } from "./farmerProfile.model";



interface Ibuyer extends Document{
    userId:mongoose.Types.ObjectId;
    fullName:string;
    buyerType:'Individual'|'Wholesaler'|'Retailer'|'Processor';
    businessName?:string;
    email?:string;
    phoneNumbe2:string;
    address:IAddress;
    gstNumber?:string;
    perferredCrops?:mongoose.Types.ObjectId[],
    isVerified:boolean;
    createdAt:Date;
    updatedAt:Date;
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
    businessName:{
        type:String
    },
    phoneNumbe2:{
        type:String,
        required:false,
        unique:true
    },
    email:{
        type:String
    },
    address:{
        village:String,
        block:String,
        district:String,
        state:String,
        pincode:Number,
        coordinates:{
            type:{
                type:String,
                enum:['Point'],
                default:'Point'
            },
            coordinates:{
                type:[Number],
                required:false
            }
        },

    },

    gstNumber:{
        type:String,
        unique:true,
        sparse:true,
        trim:true
    },
    perferredCrops:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Crop',
            required:false
        }
    ],
    isVerified:{
        type:Boolean,
        default:false
    }
    
},{timestamps:true})


buyerSchema.index({"address.coordinates":"2dsphere"},{sparse:true})

export const buyer:Model<Ibuyer> = mongoose.models.Buyer || mongoose.model<Ibuyer>("Buyer",buyerSchema)