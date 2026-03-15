import mongoose from "mongoose";
import { Product,ProductStatus,ProductCategory } from "../models/product.model";
import type { CreateProductBody, UpdateProductBody, ProductImage } from "../schema/product.schema";

// create

export const createProduct = async(
farmerId: string,
  data: CreateProductBody,
  images: ProductImage[]
)=>{
    return await Product.create({
    farmer: new mongoose.Types.ObjectId(farmerId),
    ...data.body,
    harvestDate: new Date(data.body.harvestDate),
    images,
  });

    
};




export const updateProduct = async (
  productId: string,
  farmerId: string,
  data: UpdateProductBody,
  newImages: ProductImage[] = []
) => {
  const updateData: Record<string, unknown> = { ...data.body };

  if (newImages.length > 0) {
    updateData["$push"] = { images: { $each: newImages } };
    delete updateData.images;
  }

  return await Product.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(productId),
      farmer: new mongoose.Types.ObjectId(farmerId),
    },
    updateData,
    { new: true }
  );
};

export const deleteProductById = async (
  productId: string,
  farmerId: string
) => {
  const deletedProduct = await Product.findOneAndDelete({
    _id: new mongoose.Types.ObjectId(productId),
    farmer: new mongoose.Types.ObjectId(farmerId),
  });
  return { deletedProduct };
};


// Farmer ki listings

export const getMyProducts = async(
  farmerId:string,
  page:number=1,
  limit:number=10
)=>{
  const aggregate = Product.aggregate([
    {
      $match:{
        farmer:new mongoose.Types.ObjectId(farmerId)
      },
    },
    {
      $project:{
        name:1,
        price:1,
        unit:1,
        quantity:1,
        category:1,
        status:1,
        images:{
          $slice:["$images",1]
        },
        harvestDate:1,
        location:1,
        createAt:1,
      }
    },
    {
      $sort:{
        createdAt:-1
      }
    }
  ]);

  return await Product.aggregatePaginate(aggregate,{page,limit})
}


// Buyer ke liye- public listing

export const getAllProducts = async(
  filters:{
    category?:string;
    minPrice?:number;
    maxPrice?:number;
    state?:string;
    search?:string;
  },
  page:number=1,
  limit:number=10
)=>{
  const matchStage:any = {
    status:ProductStatus.ACTIVE
  };

  if(filters.category) matchStage.category = filters;

  if(filters.state) matchStage["location.state"]=filters.state;

  if(filters.search){
    matchStage.name = {
      $regex:filters.search, $options:"i"
    }
  }

  if(filters.minPrice || filters.maxPrice){
    matchStage.price= {};
    if(filters.minPrice) matchStage.price.$gte = filters.minPrice;
    if(filters.maxPrice) matchStage.price.$lte = filters.maxPrice;
  }

  const aggregate = Product.aggregate([
    {
      $match:matchStage
    },
    {
      $lookup:{
        from:"users",
        localField:"farmer",
        foreignField:"_id",
        as:"farmer",
        pipeline:[
          {
            $project:{
              _id:1,
              phone:1
            }
          }
        ]
      }
    },
    {
      $unwind:"$farmer"
    },
    {
      $lookup:{
        from:"farmers",
        localField:"farmer._id",
        foreignField:"userId",
        as:"farmerProfile",
        pipeline:[
          {
            $project:{
              fullName:1,
              "address.district":1,
              "address.state":1
            }
          }
        ]
      }
    },
    {
      $unwind:{
        path:"$farmerProfile",
        preserveNullAndEmptyArrays:true
      }
    },
    {
      $project:{
        name:1,
        price:1,
        unit:1,
        quantity:1,
        category:1,
        image:{
          $slice:["$images",1]
        },
        location:1,
        harvestDate:1,
        createdAt:1,
        farmer:{
          _id:"$farmer._id",
          fullName:"$farmerProfile.fullName",
          district:"$farmerProfile.address.district",
          state:"$farmerProfile.address.state"
        }
      }
    },
    {
      $sort:{
        createdAt:-1
      }
    }
  ])

  return await Product.aggregatePaginate(aggregate,{
    page,
    limit
  })
}

// Single product detail

export const getProductById = async (productId:string)=>{
  const result = await Product.aggregate([
    {
      $match:{
        _id:new mongoose.Types.ObjectId(productId)
      }
    },
    {
      $lookup:{
        from:"users",
        localField:"farmer",
        foreignField:"_id",
        as: "farmer",
        pipeline:[{
          $project:{
            phone:1
          }
        }]
      }
    },{
      $unwind:"$farmer"
    },
    {
      $lookup:{
        from:"farmers",
        localField:"farmer",
        foreignField:"userId",
        as:"farmerProfile",
        pipeline:[
          {
            $project:{
              fullName:1,
              "address.village":1,
              "address.district":1,
              "address.state":1
            }
          }
        ]
      }
    },
    {
      $unwind:{
        path:"$farmerProfile",preserveNullAndEmptyArrays:true
      }
    },
    {
      $project:{
        name:1,
        description:1,
        price:1,
        unit:1,
        quantity:1,
        category:1,
        images:1,
        location:1,
        harvestDate:1,
        status:1,
        farmer:{
          _id:"$farmer._id",
          phone:"$farmer.phone",
          fullName:"$farmerProfile.fullName",
          address:"$farmerProfile.address"
        }
      }
    }

  ])

  return result[0]??null;
}