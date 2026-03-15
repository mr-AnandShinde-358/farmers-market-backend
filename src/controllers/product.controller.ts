import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { AuthenticatedRequest } from "../types/auth.interface";
import { createProductSchema, updateProductSchema } from "../schema/product.schema";
import * as productService from "../services/product.services";
import { uploadProductImages, deleteProductImages } from "../services/imagekit.service";
import type { CreateProductBody, ProductImage, UpdateProductBody } from "../schema/product.schema";
import { IImage } from "../models/product.model";

// create products

export const createProductController = catchAsync(
    async (req: Request, res: Response) => {
        // const authReq = req as AuthenticatedRequest;
        const farmerId = req.user!._id.toString();
        // const files = req.files as MulterFile[];
        const files = (req.files ?? []) as any[];
        if (!files || files.length === 0) {
            throw new ApiError("At least one product image is required", 400,);
        }

        // Upload images to ImageKit
        const uploadedImages = await uploadProductImages(files);

        // Create product with image URLs
        const product = await productService.createProduct(
            farmerId,
            { body: req.body } as CreateProductBody,
            uploadedImages);

        res
            .status(201)
            .json(new ApiResponse(201, product, "Product created successfully"));
    }
);


// update products

export const updateProductController = catchAsync(
    async (req: Request, res: Response) => {
        //  const authReq = req as AuthenticatedRequest; // ← andar cast
   
        const farmerId = req.user!._id.toString();
        const { productId } = req.params;
        // const files = (req.files?[]) as any[];
        const files = (req.files ?? []) as any[];
        let newImages: ProductImage[] = [];

        if (files && files.length > 0) {
            newImages = await uploadProductImages(files);
        }

        const product = await productService.updateProduct(
            productId!,
            farmerId,
            { body: req.body } as UpdateProductBody,
            newImages
        )

        if (!product) throw new ApiError("Product not found", 404)

        res
            .status(200)
            .json(
                new ApiResponse(200, product, "Product updated successfully")
            )
    }
)


// Delete Product

export const deleteProductController = catchAsync(
    async (req: Request, res: Response) => {
        // const authReq = req as AuthenticatedRequest; // ← andar cast
        
        const farmerId = req.user!._id.toString();
        const { productId } = req.params;
        if (!productId) throw new ApiError("Product id not found", 404)

        const { deletedProduct } = await productService.deleteProductById(productId, farmerId);

        if (!deletedProduct) throw new ApiError("Product not found", 404)

        // Delete images from Imagekit

        // Delete images from ImageKit
        const fileIds = deletedProduct.images.map(
            (img: { fileId: string }) => img.fileId
        );
        await deleteProductImages(fileIds)

        res
            .status(200)
            .json(new ApiResponse(200, null, "Product deleted successfully"));
    }



)

// getMyProducts-farmers

export const getMyProducts = catchAsync(
    async(req:
        Request,res:Response)=>{
        const page = Number(req.query.page)||1;
        const limit = Number(req.query.limit)|| 10;

        // const authReq = req as unknown as AuthenticatedRequest; // ← andar cast
    
        const products = await productService.getMyProducts(
            req.user!._id.toString(),
            page,
            limit
        );

        res.json(
            new ApiResponse(200,products,"Products fetched")
        )
    }
)

//getAllProducts

export const getAllProducts = catchAsync(
    async(req:Request,res:Response)=>{
        const {
            category,minPrice,maxPrice,state,search,page,limit
        }= req.query;

        const filters = {
            ...(category && {category:category as string}),
            ...(state && {state:state as string}),
            ...(search && {search:search as string}),
            ...(minPrice && {minPrice:Number(minPrice)}),
            ...(maxPrice && {maxPrice:Number(maxPrice)})
            
        }

        const products = await productService.getAllProducts(
            filters,
            Number(page)||1,
            Number(limit)||10
        )
        
        res.json(new ApiResponse(200,products,"product fetched"))
    }
)

//getProduct

export const getProduct = catchAsync(
    async(req:Request,res:Response)=>{

        const product = await productService.getProductById(req.params.id!)

        if(!product) throw new ApiError("Product not found",404);

        res.json(
            new ApiResponse(200,product,"Product fetched")
        )
    }
);

