import User from "../models/User.js";
import signToken from "../config/signToken.js";
import { errorHandler } from "../config/errorHandler.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
// import cookie from "cookie-parser";

dotenv.config();

export async function signUp(req,res,next){
    try{
        const {
            firstName, lastName,
            email, phoneNumber,
            password, residentialAddress,
            postalAddress, role
        } = req.body;
        const userExist = await User.findOne({email});
        if(userExist){
            return next(errorHandler(401,"Email is already being used"));
        }
        const hashPassword = await bcrypt.hashSync(password,10);
        if(!hashPassword) return next(errorHandler(401,"Error hashing password"));
        // if(comparePassword){
        //     return next(errorHandler(401,"Password already exists"));
        // }

        const newUser = await new User({
            firstName,lastName,email,password:hashPassword,phoneNumber,
            residentialAddress,postalAddress, role: role || "client"
        });
        if(!newUser) return next(errorHandler(401,"Failed to register"));
        await newUser.save();

        const token = await signToken(newUser);

        if(!token) return next(errorHandler(401, "Failed to generate token"));

        res.cookie("token",token, {
            httpOnly: true,
            // secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 10 * 60 * 60 * 1000 // 10 hours
        }).status(201).json({
            message:"Registration successful",
            user:{
                id: newUser._id,
                email: newUser.email,
                role: newUser.role
            }
        });
    }catch(err){
        next(err);
    }
}

export async function signIn(req,res,next){
    try{
        const {email,password} = req.body;
        const validUser = await User.findOne({email});
        if(!validUser) return next(errorHandler(401,"Invalid email"));
        const comparePassword = await bcrypt.compareSync(password, validUser.password);
        if(!comparePassword) return next(errorHandler(401,"Invalid password"));

        const token = await signToken(validUser);

        if(!token) return next(errorHandler(401, "Failed to generate token"));
        res.cookie("token",token, { httpOnly: true, 
            // secure: process.env.NODE_ENV === "production",
            sameSite: "strict", maxAge: 10 * 60 * 60 * 1000 // 10 hours
        })
        .status(200)
        .json({message:"Login successful",
            user:{
                id: validUser._id,
                email: validUser.email,
                role: validUser.role
            },
        });
    }catch(err){
        next(err);
    }
}
