import express from "express";   // Importing the Express framework
import mongoose from "mongoose";   // Importing Mongoose for MongoDB interactions
import userRouter from "./routers/userRouter.js";
import authenticateUser from "./middlewares/authentication.js";
import productRouter from "./routers/productRouter.js";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();   // Load environment variables from .env file

const app = express();
let port = 3000;
const mongodbURI = process.env.MONGO_URI

mongoose.connect(mongodbURI).then(() => {
    console.log("Connected to MongoDB");
}).catch((error) => {
    console.error("Error connecting to MongoDB:", error);
});

app.use(cors());    // Middleware to enable CORS

app.use(express.json());    // Middleware to parse JSON bodies

app.use(authenticateUser);

app.use("/api/users", userRouter);
app.use("/api/products", productRouter)


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})