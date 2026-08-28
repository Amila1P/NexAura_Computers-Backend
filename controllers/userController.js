import User from "../models/user.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

export async function createUser(req, res){

    try{
        const { email, password, firstName, lastName } = req.body

        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({
                message : "Email, password, first name, and last name are required"
            })
        }

        const passwordHash = bcrypt.hashSync(password, 10)

        const newUser = new User({
        email : email,
        firstName : firstName,
        lastName : lastName,
        password : passwordHash
        })

        await newUser.save()

        return res.json({
            message : "User created successfully"
        })
    }catch(error){
        if (error.code === 11000) {
            return res.status(409).json({
                message : "Email already exists"
            })
        }

        return res.status(500).json(
            {
                message : "Error creating user"
            }
        )
    }
}

export async function loginUser(req, res){
    //req.body.email
    //req.body.password

    try{
        const logedUser = await User.findOne({
            email : req.body.email
        })

        if(!logedUser){
            return res.status(404).json({
                message : "User not Found"
            })
        }

        if(!req.body.password){
            return res.status(400).json({
                message : "Password is required"
            })
        }

        const isPasswordCorrect = bcrypt.compareSync(req.body.password, logedUser.password)
        
        if(isPasswordCorrect){
            
            const payload = {
                email : logedUser.email,
                firstName : logedUser.firstName,
                lastName : logedUser.lastName,
                isAdmin : logedUser.isAdmin,
                isBlocked : logedUser.isBlocked,
                isEmailVerified : logedUser.isEmailVerified,
                profilePicture : logedUser.profilePicture
            }

            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn : "48h"})
            
            return res.json({
                token : token,
                isAdmin : logedUser.isAdmin
            })
        }else {
            return res.status(401).json({
                message : "Invalid Password"
            })
        }
    }catch(error){
        return res.status(500).json(
            {
                message : "Error logging in"
            }
        )
    }
}

export async function getUserData(req, res){
    if(req.user == null){
        res.status(401).json({
            message : "Unauthorized"
        })
    }else{
        res.json(req.user)
    }
}

export async function updateUserData(req, res){
    if(req.user == null){
        res.status(401).json({
            message : "Unauthorized"
        })
    }else{
        try{
            await User.findOneAndUpdate(
                {email : req.user.email},
                {firstName : req.body.firstName, lastName : req.body.lastName, profilePicture : req.body.profilePicture}
            )
            const updatedUser = await User.findOne({email : req.user.email})
            const token = jwt.sign({
                email : updatedUser.email,
                firstName : updatedUser.firstName,
                lastName : updatedUser.lastName,
                isAdmin : updatedUser.isAdmin,
                isBlocked : updatedUser.isBlocked,
                isEmailVerified : updatedUser.isEmailVerified,
                profilePicture : updatedUser.profilePicture
            }, process.env.JWT_SECRET, { expiresIn : "48h"})
            
            res.json({
                message : "User data updated successfully",
                token : token
            })
        }catch(error){
            res.status(500).json({
                message : "Error updating user data"
            })
        }
    }
}

export async function changePassword(req, res){
    if(req.user == null){
        res.status(401).json({
            message : "Unauthorized"
        })
    }
    try{
        const hashedPassword = bcrypt.hashSync(req.body.newPassword, 10)
        await User.findOneAndUpdate(
            {email : req.user.email},
            {password : hashedPassword}
        )
        res.json({
            message : "Password changed successfully"
        })
    }catch(error){
        res.status(500).json({
            message : "Error changing password"
        })
    }
}


export default function isAdmin(req){
    if(req.user == null){
        return false
    }
    if(req.user.isAdmin){
        return true
    }else{
        return false
    }
}