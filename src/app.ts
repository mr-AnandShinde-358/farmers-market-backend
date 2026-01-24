import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import { globalErrorHandler } from "./middleware/error.middleware";
import { ApiError } from "./utils/ApiError";

import type { NextFunction, Request, Response } from "express";
import { checkHealth } from "./controllers/health.controller";

// Load environment variables
dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

// Global rate limiting

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMS
  message: "Too many requests from this IP,Pleae try again later",
});

// security middleware
app.use(helmet()); // set security HTTP headers
app.use(hpp()); // Prevent HTTP parameter pollution

app.use("/api", limiter); // Apply rate limiting to all routes

// Logging middleware

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Body Parser Middleware

app.use(express.json({ limit: "10kb" }));

// Body limit is 10kb

app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(cookieParser());

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:5173", // Web Frontend (Local)
        "http://192.168.1.5:5173", // Network IP (Agar phone se test kar rahe ho)
        "https://your-production-domain.com", // Production URL
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "device-remember-token",
      "Access-Control-Allow-Origin",
      "Origin",
      "Accept",
    ],
  }),
);


// API Routes

app.use("/health", checkHealth)


// 404 handle

// unknown route
// app.all("*",(req:Request,res:Response,next:NextFunction)=>{
//     const err = new Error(`Route ${req.originalUrl} not found`) as any;
//     err.statusCode=404;
//     next(err)
// })
// doing second ways

app.all("*",(req:Request,res:Response,next:NextFunction)=>{
  next(new ApiError(`Route ${req.originalUrl} not found`,404))
})

// Gloabal Error Handler.

// app.use((err:Error,req:Request,res:Response,next:NextFunction)=>{
//     console.log(err)
//     return res.status(500).json({
//         status:"error",
//         message:err.message || 'Internal server error',
//         ...(process.env.NODE_ENV === "development" && {stack:err.stack})
//     })
// })
// doing second ways

app.use(globalErrorHandler)
export default app