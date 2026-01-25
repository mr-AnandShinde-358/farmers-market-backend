import mongoose from "mongoose";
import type { Document,Model,Schema } from "mongoose";

export enum AdminSubRole {
    SUPER_ADMIN = "SUPER_ADMIN",
    SUPPORT = "SUPPORT",
    VERIFIER = "VERIFIER"
}
interface Iadmin extends Document{
    userId:mongoose.Types.ObjectId;
    adminRole:AdminSubRole;
    employeeId:string;
    permissions:string[];
    isActive:boolean;
    lastActionAt?:Date;
}


const adminSchema:Schema<Iadmin> = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
        unique:true
    },
    adminRole:{
        type:String,
        enum:Object.values(AdminSubRole),
        default:AdminSubRole.VERIFIER
    },
    employeeId:{
        type:String,
        unique:true,
        required:true,
        trim:true
    },
    permissions:[
        {
            type:String
        }
    ],
    isActive:{
        type:Boolean,
        default:true
    },
    lastActionAt:{
        type:Date
    }
},{timestamps:true})


export const admin:Model<Iadmin> = mongoose.model<Iadmin>("Admin",adminSchema)