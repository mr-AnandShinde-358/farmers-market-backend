require('dotenv').config()
import mongoose from "mongoose";
import type { Document,Model,Schema } from "mongoose";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export enum UserRole {
    ADMIN="ADMIN",
    FARMER="FARMER",
    LOGISTICS="LOGISTICS",
    BUYER="BUYER"
}

interface Iuser extends Document{
    phone:string;
    email:string;
    password:string;
    role:UserRole;
    isVerified?:boolean;
    createdAt: Date; 
    updatedAt: Date; 
    refreshToken ?:string;
    comparePassword:(password:string)=>Promise<boolean>;
    generateAccessToken:()=> string;
    generateRefreshToken:()=>string;
}


const emailRegexPattern: RegExp = /^[^\s@]*@[^\s@]+\.[^\s@]+$/;

const userSchema:Schema<Iuser> = new mongoose.Schema({
    phone:{
        type:String,
        required:[true,'Please enter your phone number'],
        unique:true
    },
    email:{
        type:String,
        required:[true,"Please enter a valid email"],
        validate:{
            validator:function (value:string){
                return emailRegexPattern.test(value)
            },
            message:'Please enter a valid email'
        },
        unique:true,
        lowercase:true
        
    },

    password:{
        type:String,
        minLength:[6,'Password must be at least 6 characters'],
        select:false,
        required:[true,'Password is Required']
    },
    role:{
        type:String,
        enum:Object.values(UserRole),
        default:UserRole.BUYER
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    refreshToken:{
        type:String,
        select:false
    }

},{timestamps:true})

// pre-save hashpassword

userSchema.pre("save", async function(next){
    if(!this.isModified(this.password)) return next()
   this.password = await bcrypt.hash(this.password,10)
   next()
})

// compare-password for login
userSchema.methods.comparePassword = async function(password:string){
    return await bcrypt.compare(password,this.password)
}
// generateAccessToken
userSchema.methods.generateAccessToken =     function():string{

const secret = process.env.ACCESS_TOKEN_SECRET;
const expiry = process.env.ACCESS_TOKEN_EXPIRESIN as any

    if (!secret) {
        throw new Error("ACCESS_TOKEN_SECRET is missing in .env file");
    }
return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            phone: this.phone,
            role: this.role
        },
        secret as string,
        {
            expiresIn: expiry || '1d' // Default 1 day for mobile users
        }
    );
}
// generateRefreshToken

userSchema.methods.generateRefreshToken = function():string {
    const secret = process.env.REFRESH_TOKEN_SECRET;
const expiry = process.env.REFRESH_TOKEN_EXPIRESIN as any

if(!secret){
     throw new Error("REFRESH_TOKEN_SECRET is missing in .env file");
}

return jwt.sign({
     _id: this._id,
},
secret as string,
{
    expiresIn:expiry
}
)
}


export const User:Model<Iuser> = mongoose.model<Iuser>("User",userSchema)