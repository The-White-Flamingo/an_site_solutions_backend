import User from '../models/User.js';
import {errorHandler} from '../config/errorHandler.js';
import {signToken} from '../auth/auth.js';
import bcrypt from 'bcryptjs';
import asyncHandler from 'express-async-handler';
import BillingInfo from '../models/BillingInfo.js';
// import Surveyor from '../models/Surveyor.js';

// create a new client (user) api/signup
export const signup = asyncHandler(async (req, res, next) => {
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
            secure: process.env.NODE_ENV === "production",
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
    }catch(error){
        next(error);
    }
});

// client (user) login api/signin
export const signin = asyncHandler(async (req, res, next) => {
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
    }catch(error){
        next(error);
    }
});

// client (user) logout api/signout
export const signout = asyncHandler(async (req, res, next) => {
    try{
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        }).status(200).json({message:"Logout successful"});
    }catch(error){
        next(error);
    }
});

// get client (user) profile api/profile
export const getProfile = asyncHandler(async (req, res, next) => {
    try{
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password');
        if(!user) return next(errorHandler(404,"User not found"));
        res.status(200).json({user});
    }catch(error){
        next(error);
    }
});

// update client (user) profile api/profile
export const updateProfile = asyncHandler(async (req, res, next) => {
    try{
        const userId = req.user.id;
        const updates = req.body;
        
        if(updates.password){
            const hashPassword = await bcrypt.hashSync(updates.password,10);
            if(!hashPassword) return next(errorHandler(401,"Error hashing password"));
            updates.password = hashPassword;
        }
        const updatedUser = await User.findByIdAndUpdate(userId, updates, {new: true}).select('-password');
        if(!updatedUser) return next(errorHandler(404,"User not found"));
        res.status(200).json({message:"Profile updated successfully", user: updatedUser});
    }catch(error){
        next(error);
    }
});

// billing information
export const setUpBillingInfo = asyncHandler(async (req, res, next) => {
    try{
        const userId = req.user.id;
        const {firstName,lastName,country,companyTitle,city,address,postCode,email,phone} = req.body;
        const user = await User.findById(userId);
        if(!user) return next(errorHandler(404,"User not found"));
        const billingInfo = new BillingInfo({
            user: userId,
            firstName,lastName,country,companyTitle,city,
            address,postCode,email,phone
        });
        if(!billingInfo) return next(errorHandler(400,"Failed to create billing information"));

        await billingInfo.save();
        res.status(201).json({message:"Billing information saved successfully", billingInfo});
    }catch(error){
        next(error);
    }

});

// update billing information
export const updateBillingInfo = asyncHandler(async (req, res, next) => {
    try{
        const userId = req.user.id;
        const {firstName,lastName,country,companyTitle,city,address,postCode,email,phone} = req.body;
        const billingInfo = await BillingInfo.findOne({user: userId});
        if(!billingInfo) return next(errorHandler(404,"Billing information not found"));
        billingInfo.firstName = firstName || billingInfo.firstName;
        billingInfo.lastName = lastName || billingInfo.lastName;
        billingInfo.country = country || billingInfo.country;
        billingInfo.companyTitle = companyTitle || billingInfo.companyTitle;
        billingInfo.city = city || billingInfo.city;
        billingInfo.address = address || billingInfo.address;
        billingInfo.postCode = postCode || billingInfo.postCode;
        billingInfo.email = email || billingInfo.email;
        billingInfo.phone = phone || billingInfo.phone;
        const updatedBillingInfo = await billingInfo.save();
        res.status(200).json({message:"Billing information updated successfully", billingInfo: updatedBillingInfo});
    }catch(error){
        next(error);
    }   
});