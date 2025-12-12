import { errorHandler } from "../config/errorHandler.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const createClientToken = (user)=>{
    try{
        const token = jwt.sign(
            {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                // residentialAddress: user.residentialAddress,
                // postalAddress: user.postalAddress,
                // phoneNumber: user.phoneNumber,
                // profilePhoto: user.profilePhoto,
                role: user.role || "client"
            },
            process.env.CLIENT_JWT_SECRET,
            {
                expiresIn: "30min"
            }
        );
        if(!token) throw new Error("Unable to generate token");
        return token;
    }catch(error){
        throw new Error("Unable to generate token");
    }
}    
   

export const verifyClientToken = (req,res,next)=>{
    try{
        const token = req.cookies?.clientToken;
        if(!token) return next(errorHandler(401, "Access denied. No token provided."));
        jwt.verify(token, process.env.CLIENT_JWT_SECRET, (err, decoded) => {
            if (err) return next(errorHandler(403, "Invalid or expired token"));
            req.user = decoded;
            next();
        });
    }catch(error){
        next(errorHandler(500, "Token verification failed"));
    }
}

