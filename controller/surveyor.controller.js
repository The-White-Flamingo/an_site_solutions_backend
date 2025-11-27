import Surveyor from "../models/Surveyor.js";
import User from "../models/User.js";
import {errorHandler} from '../config/errorHandler.js';
import {SignToken} from '../auth/auth.js';
import bcrypt from 'bcryptjs';
import asyncHandler from 'express-async-handler';
import BillingInfo from "../models/BillingInfo.js";
import Survey from "../models/Survey.js";

// surveyor signup
export const signup = asyncHandler( async(req,res,next)=>{
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
        const newUser = await User.create({
            firstName,lastName,email,password:hashPassword,phoneNumber,
            residentialAddress,postalAddress, role: "surveyor"
        });

        if(!newUser) return next(errorHandler(401,"Failed to register"));
        const surveyor = await Surveyor.create({user: newUser._id});
        await newUser.save();

        if(!surveyor) return next(errorHandler(401,"Failed to register"));
        await surveyor.save();

        const token = SignToken(newUser);
        

        if(!token) return next(errorHandler(401, "Failed to generate token"));
        res.cookie("token",token, { httpOnly: true, 
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict", maxAge: 10 * 60 * 60 * 1000 // 10 hours
        }).status(200).json({
            message: "Registration successful",
            user: {
                userId: newUser._id,
                email: newUser.email,
                role: newUser.role
            },
            surveyorId: surveyor._id,
        }); 
    }catch(error){
        next(error);
    }
})

// signin
export const signin = asyncHandler( async(req,res,next)=>{
    try{
        const {email,password} = req.body;
        const validUser = await User.findOne({email});
        if(!validUser) return next(errorHandler(401,"Invalid email"));
        
        // if(validUser.role !== "surveyor"){
        //     return next(errorHandler(401,"Unauthorized access"));
        // }

        const comparePassword = bcrypt.compareSync(password, validUser.password);
        if(!comparePassword) return next(errorHandler(401,"Invalid password"));

        const surveyor = await Surveyor.findOne({user:validUser._id});
        if(!surveyor) return next(errorHandler(404,"No such user available"));

        const token = SignToken(validUser);

        if(!token) return next(errorHandler(401, "Failed to generate token"));
        res.cookie("token",token, { httpOnly: true, 
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict", maxAge: 10 * 60 * 60 * 1000 // 10 hours
        }).status(200)
        .json({message:"Login successful",
            user:{
                id: validUser._id,
                email: validUser.email,
                role: validUser.role
            },
            surveyorId: surveyor._id
        });

    }catch(error){
        next(error);
    }
})

// surveyor (user) logout api/signout
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

// update identify fields
export const identityField = asyncHandler( async(req,res,next)=>{
    try{
        const {profilePhoto,IDphoto,proofOfCertificate} = req.body;
        const user = await User.findByIdAndUpdate(req.user.id,{
            profilePhoto
        }, { new: true, runValidators: true });
        const surveyor = await Surveyor.findOneAndUpdate({ user: req.user.id }, {
            IDphoto, proofOfCertificate
        }, { new: true, runValidators: true });
        if (!user) return next(errorHandler(401, "Failed to update user"));
        if (!surveyor) return next(errorHandler(401, "Failed to update surveyor"));
        res.status(200).json({ message: "Identity profile updated successfully" });
    }catch(error){
        next(error);
    }
});

// update profile info
export const updateProfile = asyncHandler( async(req,res,next)=>{
    try{
        const {
            firstName,lastName,tagline,country,about,surveyorType,languages,
            yearsOfExperience,projectDetails,fileFormat,softwares,education,professionalCertifications
        } = req.body;
        const user = await User.findByIdAndUpdate(req.user.id,{
            firstName,lastName
        },{new:true,runValidators:true});
        const surveyor = await Surveyor.findOneAndUpdate({user: req.user.id},{
            tagline,country,about,surveyorType,languages,
            yearsOfExperience,projectDetails,fileFormat,softwares,education,professionalCertifications
        },{new:true,runValidators:true});
        if(!user) return next(errorHandler(401, "Failed to update"));
        if(!surveyor) return next(errorHandler(401, "Failed to update"));

        // await user.save();
        // await surveyor.save();
        res.status(200).json({message:"Profile information updated successfully", surveyor: {
            surveyor,
            id: user._id,
            email: user.email,
            role: user.role
        }});
    }catch(error){
        next(error);
    }
})

// billing information
export const setUpBillingInfo = asyncHandler(async (req, res, next) => {
    try{
        const userId = req.user.id;
        const {firstName,lastName,country,companyTitle,city,address,postCode,email,phone} = req.body;
        const user = await User.findById(userId);
        if(!user) return next(errorHandler(404,"User not found"));
        const billingInfo = await BillingInfo.create({
            user: userId,
            firstName,lastName,country,companyTitle,city,
            address,postCode,email,phone
        });
        if(!billingInfo) return next(errorHandler(400,"Failed to create billing information"));

        // await billingInfo.save();
        res.status(201).json({message:"Billing information saved successfully", billingInfo});
    }catch(error){
        next(error);
    }

});

// update billing information
export const updateBillingInfo = asyncHandler(async (req, res, next) => {
    try{
        const userId = req.user.id;
        // const updatedBillingInfo = await BillingInfo.findOneAndUpdate(
        //     { user: userId },
        //     req.body, // updates only provided fields
        //     { new: true, runValidators: true }
        // );
        // if (!updatedBillingInfo) {
        //     return next(errorHandler(404, "Billing information not found"));
        // }

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

export const getUsers = asyncHandler(async (req,res,next)=>{
    try{
        const users = await User.find({},"-password");
        if(!users) return next(errorHandler(404, "No such user"));
        res.status(200).json({
            message:"All available Users",
            users
        })
    }catch(error){
        next(error)
    }
})

// complete surveyor profile
export const completeSurveyorProfile = asyncHandler(async (req, res, next) => {
  try {
    // if (req.user.id !== req.params.userId) {
    //   res.status(401);
    //   throw new Error("You can only update your own profile.");
    // }

    // if (req.user.role !== "surveyor") {
    //   res.status(401);
    //   throw new Error("Only surveyors can update this profile.");
    // }

    const updates = req.body; // The frontend will send only fields being updated

    const surveyor = await Surveyor.findOneAndUpdate(
      { user: req.user.id },
      updates,
      { new: true, upsert: true }
    );

    const profileComplete = surveyor.isProfileComplete();

    res.status(200).json({
      message: profileComplete
        ? "Profile completed. Waiting for admin approval."
        : "Profile updated but incomplete. Continue updating.",
      profileComplete,
      surveyor,
    });

  } catch (err) {
    next(err);
  }
});

/** Get Surveys Assigned to Surveyor **/
export const getAssignedSurveys = asyncHandler(async (req, res, next) => {
  const surveyor = await Surveyor.findOne({ user: req.user.id });

  if (!surveyor) return next(errorHandler(404, "Surveyor profile not found"));

  const surveys = await Survey.find({
    assignedSurveyor: surveyor._id,
    surveyStatus: { $in: ["assigned", "accepted", "ongoing"] }
  }).sort({ createdAt: -1 });

  res.status(200).json({ surveys });
});

/** Accept Survey **/
export const acceptSurvey = asyncHandler(async (req, res, next) => {
  const surveyor = await Surveyor.findOne({ user: req.user.id });

  const survey = await Survey.findById(req.params.surveyId);
  if (!survey) return next(errorHandler(404, "Survey not found"));

  if (!survey.assignedSurveyor?.equals(surveyor._id)) {
    return next(errorHandler(403, "You are not assigned to this survey"));
  }

  if (survey.surveyStatus !== "assigned") {
    return next(errorHandler(400, "Survey is not awaiting acceptance"));
  }

  survey.surveyorResponse = "accepted";
  survey.surveyStatus = "accepted";
  await survey.save();

  res.status(200).json({ message: "Survey accepted", survey });
});

/** Decline Survey **/
export const declineSurvey = asyncHandler(async (req, res, next) => {
  const surveyor = await Surveyor.findOne({ user: req.user.id });

  const survey = await Survey.findById(req.params.surveyId);
  if (!survey) return next(errorHandler(404, "Survey not found"));

  if (!survey.assignedSurveyor?.equals(surveyor._id)) {
    return next(errorHandler(403, "You are not assigned to this survey"));
  }

  survey.surveyorResponse = "declined";
  survey.surveyStatus = "declined";
  survey.assignedSurveyor = null;
  survey.assignmentExpiresAt = null;
  await survey.save();

  res.status(200).json({ message: "Survey declined" });
});

/** Start Work **/
export const startWork = asyncHandler(async (req, res, next) => {
  const surveyor = await Surveyor.findOne({ user: req.user.id });

  const survey = await Survey.findById(req.params.surveyId);
  if (!survey) return next(errorHandler(404, "Survey not found"));

  if (!survey.assignedSurveyor?.equals(surveyor._id)) {
    return next(errorHandler(403, "You are not assigned to this survey"));
  }

  if (survey.surveyStatus !== "accepted") {
    return next(errorHandler(400, "Survey must be accepted before work begins"));
  }

  survey.surveyStatus = "ongoing";
  await survey.save();

  res.status(200).json({ message: "Survey work started", survey });
});

/** Submit Completed Work **/
export const submitWork = asyncHandler(async (req, res, next) => {
  const surveyor = await Surveyor.findOne({ user: req.user.id });

  const { deliveryNotes, files } = req.body; // files: [{fileName, fileUrl}]
  const survey = await Survey.findById(req.params.surveyId);

  if (!survey) return next(errorHandler(404, "Survey not found"));

  if (!survey.assignedSurveyor?.equals(surveyor._id)) {
    return next(errorHandler(403, "You are not assigned to this survey"));
  }

  if (survey.surveyStatus !== "ongoing") {
    return next(errorHandler(400, "Survey must be ongoing to submit work"));
  }

  survey.workSubmission = { deliveryNotes, files };
  survey.surveyStatus = "submitted";
  await survey.save();

  res.status(200).json({ message: "Work submitted, awaiting client approval", survey });
});