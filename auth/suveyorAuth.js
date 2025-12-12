import { errorHandler } from "../config/errorHandler.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const createSurveyorToken = (surveyor)=>{
    try{
        const token = jwt.sign(
            {
                id: surveyor._id,
                role: surveyor.role,
                email: surveyor.email,
                firstName: surveyor.firstName,
            },
            process.env.SURVEYOR_JWT_SECRET,
            { expiresIn: "30min" }
        );
        if(!token) throw new Error("Unable to generate token");
        return token;
    }catch(error){
        throw new Error("Unable to generate token");
    }
}

export const verifySurveyorToken = (req,res,next)=>{
    try{
        const token = req.cookies?.surveyorToken;
        if(!token) return next(errorHandler(401, "Access denied. No token provided."));
        jwt.verify(token, process.env.SURVEYOR_JWT_SECRET, (err, decoded) => {
            if (err) return next(errorHandler(403, "Invalid or expired token"));
            req.user = decoded;
            next();
        });
    }catch(error){
        next(errorHandler(500, "Token verification failed"));
    }
}

