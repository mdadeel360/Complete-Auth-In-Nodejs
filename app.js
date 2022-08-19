import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cors from "cors"
import connectDB from "./config/connectDB.js"
import userRoutes from "./routes/userRoutes.js"

const app = express()

// cors Policy
app.use(cors())

// DB Connection
connectDB(process.env.DB_URI)

app.use(express.json())

// Routes
app.use("/user", userRoutes)

// Server Config
app.listen(process.env.PORT, ()=>{
    console.log(`Server is listening at http://localhost:${process.env.PORT}`)
})