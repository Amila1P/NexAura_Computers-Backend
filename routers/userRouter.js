import express from "express";
import { changePassword, updateUserData, createUser, getUserData, loginUser } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/", createUser);
userRouter.post("/login", loginUser);
userRouter.get("/me", getUserData);
userRouter.put("/", updateUserData);
userRouter.put("/password", changePassword);

export default userRouter;