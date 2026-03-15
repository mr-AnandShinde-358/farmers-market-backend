import {z} from 'zod'
import { ProductCategory, ProductStatus } from '../models/product.model'

// Image schema — ImageKit se aata hai
const imageSchema = z.object({
  url: z.url(),
  fileId: z.string(),
  thumbnailUrl: z.url(),
});

export const createProductSchema = z.object({
  body:z.object(
    {  
        name:z.string().min(2).max(100).trim(),
        description:z.string().min(2).max(200).trim(),
        price:z.number().positive(),
        unit:z.string().default("kg"),
        quantity:z.number().positive(),
        category:z.enum(ProductCategory),
        harvestDate:z.iso.datetime(),
        location:z.object({
            district:z.string().min(1),
            state:z.string().min(1)
        }),
    }
)
})

export const updateProductSchema = z.object({
    body: createProductSchema.partial().extend({
    status:z.enum(ProductStatus).optional()
})
})


export type CreateProductBody = z.infer<typeof createProductSchema>
export type UpdateProductBody = z.infer<typeof updateProductSchema>
export type ProductImage = z.infer<typeof imageSchema>;
