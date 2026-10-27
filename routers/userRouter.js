import express from "express";
import { changePassword, updateUserData, createUser, getUserData, loginUser } from "../controllers/userController.js";
import { googleLogin } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/", createUser);
userRouter.post("/login", loginUser);
userRouter.get("/me", getUserData);
userRouter.put("/", updateUserData);
userRouter.put("/password", changePassword);
userRouter.post("/google-login", googleLogin);

export default userRouter;