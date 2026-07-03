import User from "../models/user.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

export async function createUser(req, res){

    try{

        const passwordHash = bcrypt.hashSync(req.body.password, 10)
        console.log(passwordHash)

        const newUser = new User({
        email : req.body.email,
        firstName : req.body.firstName,
        lastName : req.body.lastName,
        password : passwordHash
        })

        await newUser.save()

        return res.json({
            message : "User created successfully"
        })
    }catch(error){
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