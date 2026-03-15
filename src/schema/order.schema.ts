import {z} from 'zod';

export const createOrderSchema = z.object({
    productId:z.string().min(1,"Product required"),
    quantity:z.number().positive("Quantity must be positive"),
    note:z.string().max(200).optional()
});

export const updateOrderStatusSchema = z.object({
    status:z.enum(["ACCEPTED","REJECTED","COMPLETED","CANCELLED"])
})

export type CreateOrderBody = z.infer<typeof createOrderSchema>
export type UpdateOrderStatusBody = z.infer<typeof updateOrderStatusSchema>
