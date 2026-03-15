import mongoose from "mongoose";
import type { Document,Model,Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

export enum ProductCategory {
    GRAIN = "GRAIN",
    VEGETABLE = "VEGETABLE",
    FRUIT = "FRUIT",
    SPICE = "SPICE",
    DAIRY = "DAIRY",
    OTHER = "OTHER"
}

export enum ProductStatus {
    ACTIVE = "ACTIVE",
    SOLD_OUT="SOLD_OUT",
    INACTIVE="INACTIVE"
}
export interface IImage {
  fileId: string;
  url: string;
}

export interface IProduct extends Document {
    farmer:mongoose.Types.ObjectId;
    name:string;
    description?:string;
    price:number;
    unit:string;
    quantity:number;
    images:IImage[];
    category:ProductCategory;
    harvestDate:Date;
    location:{
        district:string;
        state:string;
    };
    status:ProductStatus;
    createdAt:Date;
    updatedAt:Date;
}

// <- Paginate ke liye special type

export interface IProductModel extends Model<IProduct>{
    aggregatePaginate:any
};

const productSchema:Schema<IProduct> = new mongoose.Schema(
    {
        farmer:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
        name:{
            type:String,
            required:true,
            trim:true,
        },
        description:{
            type:String,
            trim:true
        },
        price:{
            type:Number,
            required:true,
            min:0,
        },
        unit:{
            type:String,
            default:"kg"
        },
        quantity:{
            type:Number,
            required:true,
            min:0
        },
        images:[{
           fileId: String,
           url: String
        }],
        category:{
            type:String,
            enum:Object.values(ProductCategory),
            required:true
        },
        harvestDate:{
            type:Date,
            required:true
        },
        location:{
            district:{
                type:String,
                required:true
            },
            state:{
                type:String,
                required:true
            }
        },
        status:{
            type:String,
            enum:Object.values(ProductStatus),
            default:ProductStatus.ACTIVE
        },
        
    },
    {timestamps:true}
)

// <- plugin lagao

productSchema.plugin(mongooseAggregatePaginate);

export const Product = (
    mongoose.models.Product || mongoose.model<IProduct,IProductModel>("Product",productSchema)
) as IProductModel