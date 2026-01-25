import mongoose from "mongoose";
import type { Document,Model,Schema } from "mongoose";

export interface IAddress {
    village:string;
    block:string;
    district:string;
    state:string;
    pincode:number;
    coordinates?:{
        type:"Point";
        coordinates?:[number,number] // [longitude,latitude]
    }
}

export interface Ifarmer extends Document{
    userId:mongoose.Types.ObjectId;
    fullName:string;
    farmerId?:string;
    farmName?:string;
    phoneNumber2?:string;
    address:IAddress;
    landSize?:{
        value:number;
        unit:string;
    }
    soilType:string;
    primaryCrops?:mongoose.Types.ObjectId[];
    bankDetails?:{
        accountNumber:string;
        ifscCode:string;
        isAadhaarLinked:boolean;
    };
    kycStatus: 'Pending'|'Verified'|'Rejected';
    createdAt:Date;
    updatedAt:Date;
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
    farmerId:{
        type:String,
        unique:true,
        sparse:true,
        required:false,
    },
    farmName:{
        type:String,
        required:false
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
    landSize:{
        value:{
            type:Number,
            required:false
        },
        unit:{
            type:String,
            enum:['Acres','Hectares','Bigha','Guntha'],
            default:'Acres',
            required:false
        }
    },
    soilType:{
        type:String
    },
    primaryCrops:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Crops'
        }
    ],
    bankDetails:{
        accountNumber:{
            type:String,
            required:false
        },
        ifscCode:{
            type:String,
            required:false
        },
        isAadhaarLinked:{
            type:Boolean,
            default:false,
            required:false
        },
    },
    kycStatus:{
        type:String,
        enum:['Pending','Verified','Rejected'],
        default:'Pending'
    }


},{timestamps:true})


farmerSchema.index({"address.coordinates":"2dsphere"})

export const farmer:Model<Ifarmer> = mongoose.models.Farmer || mongoose.model<Ifarmer>("Farmer",farmerSchema)