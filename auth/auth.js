import { errorHandler } from "../config/errorHandler.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const SignToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role }, // ✅ role included
        process.env.JWT_SECRET,
        { expiresIn: "10h" }
    );
};

export const signToken = async(user)=>{
    try{
        // Include only safe user info in the token payload
        const payload = {
        id: user._id,
        // firstName: user.firstName,
        // lastName: user.lastName,
        email: user.email,
        role: user.role,
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '10h'});
        if(!token){
            throw new Error("Unable to generate token")
        }
        return token;
    }catch(e){
        throw new Error("Unable to generate token")
    }
}

export const verifyToken = (req, res, next) => {
  try {
      // console.log(req.cookies);
      const token = req.cookies?.token; 
      // console.log(token);
      if (!token) {
        return next(errorHandler(401, "Access denied. No token provided."));
      }

      
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return next(errorHandler(403, "Invalid or expired token"));

        // decoded contains id, email, role
        req.user = decoded;
        next();
      });
  } catch (error) {
      next(errorHandler(500, "Token verification failed"));
  }
};

export const verifyRole = (role)=> {
    return (req,res,next)=>{
        if(req.user.role !== role){
            return next(errorHandler(403, `Access denied: ${role} only`))
        }
        next();
    }
}

export const createRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.REFRESH_SECRET,
        { expiresIn: "10h" }
    );
}

export const refreshToken = (oldToken) => {
    try {
        const decoded = jwt.verify(oldToken, process.env.JWT_SECRET);
        const newToken = jwt.sign(
            { id: decoded.id, role: decoded.role },
            process.env.REFRESH_SECRET, { expiresIn: "7d" }
        );
        return newToken;
    } catch (error) {
        throw new Error("Unable to refresh token");
    }
}