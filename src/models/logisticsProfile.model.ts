import mongoose from "mongoose";
import type { Document,Model,Schema } from "mongoose";

interface Ilogistics extends Document{
    userId:mongoose.Types.ObjectId;
    providerName:string;
    verhicleType:'Mini Truck'|'Tempo'|'Truck'|'Tractor'|'Refrigerated',
    vehicleNumber:string;
    capacity:{
        value:number;
        unit:'kg'|'ton';
    };
    currentLocation:{
        type:"Point";
        coordinates:[number,number];
    };
    serviceAreas:string[];
    basePricePerKm:number;
    isAvailable:boolean;
    rating:number;
    createdAt:Date;
    updatedAt:Date;
}


const logisticsSchema:Schema<Ilogistics> = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    providerName:{
        type:String,
        required:true,
        trim:true
    },
    verhicleType:{
        type:String,
        enum:['Mini Truck','Tempo','Truck','Tractor','Refrigerated'],
        required:true
    },
    vehicleNumber:{
        type:String,
        required:true,
        unique:true,
        uppercase:true,
        trim:true
    },
    capacity:{
        value:{
            type:Number,
            required:true
        },
        unit:{
            type:String,
            enum:['kg','ton'],
            default:'ton'
        },
    },
    currentLocation:{
        type:{
            type:String,
            enum:['Point'],
            default:'Point'
        },
        coordinates:{
            type:[Number],
            required:true
        }
    },
    serviceAreas:[
        {
            type:String
        }
    ],
    basePricePerKm:{
        type:Number,
        required:true
    },
    isAvailable:{
        type:Boolean,
        default:true
    },
    rating:{
        type:Number,
        default:5,
        min:0,
        max:5
    }
},{timestamps:true})

logisticsSchema.index({ "currentLocation": "2dsphere" });

export const logistics:Model<Ilogistics> = mongoose.model<Ilogistics>("Logistics",logisticsSchema)