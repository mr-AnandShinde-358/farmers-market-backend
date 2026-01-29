import {z} from "zod";

export const createUserSchema = z.object({
    body:z.object({
        phone:z.string().length(10,"Phone number must be exactly 10 digits"),
        email:z.email("Invalid email address"),
        password:z.string().min(6,'Minimum 6 world required'),
        role:z.enum(["ADMIN","FARMAR","LOGISTICS","BUYER"]).optional()

    })
})


export const loginUserSchema = z.object({
    body:z.object({
        email:z.email("Ema0il is required"),
        password:z.string().min(6,"minmum is 6 letter")
    })
})