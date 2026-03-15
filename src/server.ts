import dotenv from "dotenv"
dotenv.config()
import  app  from "./app";

import connectDB from "./database/db"

const PORT = process.env.PORT || 500

connectDB()

app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`)
})