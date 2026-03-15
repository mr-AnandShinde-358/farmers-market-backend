import {z} from "zod";

export const farmerProfileSchema = z.object({
    body:z.object({
        fullName:z.string().min(2).max(100).trim(),
        phoneNumber2:z.string().optional(),
        address:z.object({
            village:z.string().optional(),
            district:z.string().min(1,"District required"),
            state:z.string().min(1,"State required"),
            pincode:z.number().optional()
        })
    })
})

export type FarmerProfileBody = z.infer<typeof farmerProfileSchema>