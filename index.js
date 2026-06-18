import express from "express";   // Importing the Express framework
import mongoose from "mongoose";   // Importing Mongoose for MongoDB interactions
import userRouter from "./routers/userRouter.js";
import authenticateUser from "./middlewares/authentication.js";
import productRouter from "./routers/productRouter.js";

const app = express();
let port = 3000;
const mongodbURI = "mongodb+srv://admin:admin123@cluster0.nobsocy.mongodb.net/i_computer?appName=Cluster0"

mongoose.connect(mongodbURI).then(() => {
    console.log("Connected to MongoDB");
}).catch((error) => {
    console.error("Error connecting to MongoDB:", error);
});


app.use(express.json());    // Middleware to parse JSON bodies

app.use(authenticateUser);

app.use("/users", userRouter);
app.use("/products", productRouter)


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})