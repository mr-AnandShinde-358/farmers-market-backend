import type { Request,Response,NextFunction } from "express";
import { ApiError } from "../utils/ApiError";


// 1. specific Errors ko handle karne ke functions

const handleCastErrorDB = (err:any)=>{
    const message = `Invalid ${err.path}:${err.value}`

    return new ApiError(message,400)
}


const handleDuplicateFieldDB = (err:any)=>{
    const value = err.keyValue ? Object.values(err.keyValue)[0]:'unknown';

    const message= `Duplicate field value: ${value}. Please use another value`

    return new ApiError(message,400)
}


const handleValidationErrorDB = (err:any)=>{
    // mongoose validation errors ka array hota hai unhe join karke hai 

    const errors = Object.values(err.errors).map((el:any)=>el.message)

    const message = `Invalid input data ${errors.join('. ')}`;

    return new ApiError(message,400)
}

const handleJWTError = () => new ApiError('Invalide token. please log in again',401)

const handleJWTExpiredError = ()=> new ApiError('Your token has expired! please log in again',401)

// 2. Development error response (full details)

const sendErrorDev =(err:ApiError,res:Response)=>{
    res.status(err.statusCode).json({
        status:err.status,
        error:err,
        messages:err.message,
        stack:err.stack

    })
}


// 3. Production Error Response clean message

const sendErrorProd = (err:ApiError,res:Response)=>{
    // a) agar operational (expected error. hai :client ko message bhejo)

    if(err.isOperational){
        res.status(err.statusCode).json({
            status:err.status,
            message:err.message
        })
    }// B) agar programming error hai client ko details mat dikhao bus generic message

    else {
        console.error('ERROR',err) // serveer logs main print karo

        res.status(500).json({
            status:'error',
            message:'Something went very wrong'
        })
    }
    
    

}



// 4. Main Exported Middleware 

export const globalErrorHandler = (err:any,req:Request,res:Response,next:NextFunction)=>{
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV ==='development'){
        sendErrorDev(err,res)
    }else {
        // Production ke liye error ki copy banao taaki original mutate na ho

        let error = { ...err}

        error.message = err.message;
        error.name = err.name

        // MongoDB Specific Errors Check

        if(err.name === 'CastError') error=handleCastErrorDB(err)

        if(err.code === 11000) error = handleDuplicateFieldDB(err)

        if(err.name ==='ValidationError') error = handleValidationErrorDB(err)

        if(err.name === 'JsonWebTokenError') error = handleJWTError()
        
        if(err.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorProd(error,res)
    }
}