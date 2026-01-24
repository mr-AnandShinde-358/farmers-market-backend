import  app  from "./app";

import dotenv from "dotenv"
import connectDB from "./database/db"
dotenv.config()

const PORT = process.env.PORT || 500

connectDB()

app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`)
})