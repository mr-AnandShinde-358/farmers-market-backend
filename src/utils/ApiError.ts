

export class ApiError extends Error {
    statusCode:number;
    status:string;
    isOperational:boolean;

    constructor(message:string,statusCode:number){
        super(message);

        this.statusCode=statusCode;
        this.status = `${statusCode}`.startsWith('4')?'fail':'error';

        // isOperational = true matlab ye error hume pata tha aa sakta hai (Invalid input,etc)
        // isOperational = false matlab programming bug hai (code phat gaya )

        this.isOperational = true;
        Error.captureStackTrace(this,this.constructor)
    }

}