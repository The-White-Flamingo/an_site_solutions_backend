import User from '../models/User.js';
import {errorHandler} from '../config/errorHandler.js';
import bcrypt from 'bcryptjs';
import asyncHandler from 'express-async-handler';
import BillingInfo from '../models/BillingInfo.js';
import {createClientToken} from "../auth/userAuth.js";
import cloudinary from '../config/cloudinary.js';

// create a new client (user) api/signup
export const signup = asyncHandler(async (req, res, next) => {
    try{
        const {firstName, lastName, email, phoneNumber, password, residentialAddress, postalAddress, role} = req.body;
        const userExist = await User.findOne({email});
        
        if(userExist){
            return next(errorHandler(401,"Email is already being used"));
        }
        
        const hashPassword = await bcrypt.hashSync(password,10);
        if(!hashPassword) return next(errorHandler(401,"Error hashing password"));
        
        const newUser = await User.create({
            firstName, lastName, email, password: hashPassword, phoneNumber,
            residentialAddress, postalAddress, role: role || "client"
        });
        if(!newUser) return next(errorHandler(401,"Failed to register"));
        
        // await newUser.save();
        const token = await createClientToken(newUser);

        if(!token) return next(errorHandler(401, "Failed to generate token"));
        res.cookie("clientToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 30 * 60 * 1000 // 30 minutes
        }).status(200).json({user:{
            id: newUser._id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            residentialAddress: newUser.residentialAddress,
            postalAddress: newUser.postalAddress,
            phoneNumber: newUser.phoneNumber,
            profilePhoto: newUser.profilePhoto,
            role: newUser.role || "client",
        }, message: "Registration successful", token, ok:true});
    }catch(error){
        next(error);
    }
});

// client (user) login api/login
export const login = asyncHandler(async (req, res, next) => {
    try{
        const {email, password} = req.body;
        const userExist = await User.findOne({email});
        if(!userExist) return next(errorHandler(401,"Invalid email or password"));
        const comparePassword = await bcrypt.compareSync(password, userExist.password);
        if(!comparePassword) return next(errorHandler(401,"Invalid email or password"));

        const token = await createClientToken(userExist);
        if(!token) return next(errorHandler(401, "Failed to generate token"));
        res.cookie("clientToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 30 * 60 * 1000 // 30 minutes
        }).status(200).json({
            ok: true,
            message: "Login successful",
            user: {
                id: userExist._id,
                firstName: userExist.firstName,
                lastName: userExist.lastName,
                email: userExist.email,
                residentialAddress: userExist.residentialAddress,
                postalAddress: userExist.postalAddress,
                phoneNumber: userExist.phoneNumber,
                profilePhoto: userExist.profilePhoto,
                role: userExist.role || "client"
        }});
    }catch(error){
        next(error);
    }
});

// client (user) logout api/logout
export const logout = asyncHandler(async (req, res, next) => {
    try{
        res.clearCookie("clientToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        }).status(200).json({message:"Logout successful"});
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: '/api/auth/refresh-token'
        });
    }catch(error){
        next(error);
    }
});

export const authClient = asyncHandler(async (req, res, next) => {
    try{
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password');
        if(!user) return next(errorHandler(404,"User not found"));
        res.status(200).json({user: {id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            residentialAddress: user.residentialAddress,
            postalAddress: user.postalAddress,
            phoneNumber: user.phoneNumber,
            profilePhoto: user.profilePhoto,
            role: user.role || "client",
        }});
    }catch(error){
        return res.status(401).json({message: "Unathorized"});
    }
});

// get client (user) profile api/profile
export const getProfile = asyncHandler(async (req, res, next) => {
    try{
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password').populate('billingInfo');
        if(!user) return next(errorHandler(404,"User not found"));
        res.status(200).json({user});
    }catch(error){
        next(error);
    }
});

// update client (user) profile api/client/profile
export const updateProfile = asyncHandler(async (req, res, next) => {
    try{
        console.log("Request body:", req.body);
        console.log("Request file:", req.file);
        
        const userId = req.user.id;
        const updates = req.body;

        if(req.file && req.file.buffer){
            const buffer = req.file.buffer.toString('base64');
            const uploadResult = await cloudinary.uploader.upload(`data:${req.file.mimetype};base64,${buffer}`,{folder: 'profile_photos'});
        }

        updates.profilePhoto = req.file.path;
        console.log("Updates to be applied:", updates);
        
        if(updates.password){
            const hashPassword = await bcrypt.hashSync(updates.password,10);
            if(!hashPassword) return next(errorHandler(401,"Error hashing password"));
            updates.password = hashPassword;
        }
        const updatedUser = await User.findByIdAndUpdate(userId, updates, {new: true}).select('-password');
        if(!updatedUser) return next(errorHandler(404,"User not found"));
        await updatedUser.save();
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

// update password
export const updatePassword = asyncHandler(async (req, res, next) => {
    try{
        const userId = req.user.id;
        const {currentPassword, newPassword} = req.body;
        const user = await User.findById(userId);
        if(!user) return next(errorHandler(404,"User not found"));
        const comparePassword = await bcrypt.compareSync(currentPassword, user.password);
        if(!comparePassword) return next(errorHandler(401,"Current password is incorrect"));
        const hashPassword = await bcrypt.hashSync(newPassword,10);
        if(!hashPassword) return next(errorHandler(401,"Error hashing password"));
        user.password = hashPassword;
        await user.save();
        res.status(200).json({message:"Password updated successfully",ok:true});
    }catch(error){
        next(error);
    }
});