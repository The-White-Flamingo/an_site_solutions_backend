import Surveyor from "../models/Surveyor.js";
import {errorHandler} from '../config/errorHandler.js';
import bcrypt from 'bcryptjs';
import asyncHandler from 'express-async-handler';
import BillingInfo from "../models/BillingInfo.js";
import Survey from "../models/Survey.js";
import Dispute from "../models/Dispute.js"
import { createSurveyorToken } from "../auth/suveyorAuth.js";
import cloudinary from '../config/cloudinary.js';

// surveyor signup
export const signup = asyncHandler( async(req,res,next)=>{
    try{
        const {firstName, lastName, email, phoneNumber, password, residentialAddress, postalAddress, role} = req.body;
        const surveyorExist = await Surveyor.findOne({email});
        if(surveyorExist){
            return next(errorHandler(401,"Email is already being used"));
        }
        const hashPassword = await bcrypt.hashSync(password,10);
        if(!hashPassword) return next(errorHandler(401,"Error hashing password"));
        const newSurveyor = await Surveyor.create({
            firstName,lastName,email,password:hashPassword,phoneNumber,
            residentialAddress,postalAddress, role: role || "surveyor"
        });

        const token = await createSurveyorToken(newSurveyor);

        if(!token) return next(errorHandler(401, "Failed to generate token"));

        res.cookie("surveyorToken",token, { httpOnly: true, 
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict", maxAge: 30 * 60 * 1000 // 30 minutes
        }).status(200).json({
            message: "Registration successful",
            surveyor: {
                id: newSurveyor._id,
                firstName: newSurveyor.firstName,
                lastName: newSurveyor.lastName,
                role: newSurveyor.role,
                email: newSurveyor.email,
                residentialAddress: newSurveyor.residentialAddress,
                postalAddress: newSurveyor.postalAddress,
                phoneNumber: newSurveyor.phoneNumber,
                profilePhoto: newSurveyor.profilePhoto
            },
            token,
            ok:true
        });
    }catch(error){
        next(error);
    }
})

// signin
export const login = asyncHandler( async(req,res,next)=>{
    try{
        const {email,password} = req.body;
        const surveyorExist = await Surveyor.findOne({email});
        if(!surveyorExist) return next(errorHandler(401,"Invalid email or password"));
        const comparePassword = await bcrypt.compareSync(password, surveyorExist.password);
        if(!comparePassword) return next(errorHandler(401,"Invalid email or password"));
        const token = await createSurveyorToken(surveyorExist);
        if(!token) return next(errorHandler(401, "Failed to generate token"));
        res.cookie("surveyorToken",token, { httpOnly: true, secure: process.env.NODE_ENV === "production",
            sameSite: "strict", maxAge: 30 * 60 * 1000 // 30 minutes
        }).status(200).json({message:"Login successful",
            surveyor:{
                id: surveyorExist._id,
                firstName: surveyorExist.firstName,
                lastName: surveyorExist.lastName,
                email: surveyorExist.email,
                residentailAddress: surveyorExist.residentialAddress,
                postalAddress: surveyorExist.postalAddress,
                phoneNumber: surveyorExist.phoneNumber,
                profilePhoto: surveyorExist.profilePhoto,
                role: surveyorExist.role
            },
            token,
            ok:true
        });
    }catch(error){
        next(error);
    }
})

// surveyor (user) logout api/signout
export const logout = asyncHandler(async (req, res, next) => {
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

// authenticate surveyor
export const authenticateSurveyor = asyncHandler( async(req,res,next)=>{
    try{
        const surveyor = await Surveyor.findById(req.user.id).select('-password');
        if(!surveyor) return next(errorHandler(404, "No such surveyor"));
        const profileComplete = surveyor.isProfileComplete();
        // surveyor.profileComplete = profileComplete;
        res.status(200).json({
            surveyor,profileComplete
        });
    }catch(error){
        next(error);
    }
});

// get surveyor profile
export const getProfile = asyncHandler( async (req,res,next)=>{
    try{
        const surveyor = await Surveyor.findById(req.user.id).select("-password");
        if(!surveyor) return next(errorHandler(404, "No such surveyor found"));
        const profileComplete = surveyor.isProfileComplete();
        
        res.status(200).json({
            surveyor,
            profileComplete
        })
    }catch(error){
        next(error)
    }
})

// update identify fields
export const identityField = asyncHandler( async(req,res,next)=>{
    try{
        const updates = {};
        if(req.files.profilePhoto){
            const file = req.files.profilePhoto[0];
            const uploaded = await uploadToCloudinary(file.buffer, "surveyor_app");
            updates.profilePhoto = uploaded.secure_url;
        }

        if (req.files.IDphoto) {
            const file = req.files.IDphoto[0];
            const uploaded = await uploadToCloudinary(file.buffer, "surveyor_app");
            updates.IDphoto = uploaded.secure_url;
        }

        if (req.files.proofOfCertificate) {
            const file = req.files.proofOfCertificate[0];
            const uploaded = await uploadToCloudinary(file.buffer, "surveyor_app");
            updates.proofOfCertificate = uploaded.secure_url;
        }

        // const {profilePhoto,IDphoto,proofOfCertificate} = req.body;
        const user = await Surveyor.findByIdAndUpdate(req.user.id,{
            updates
        }, { new: true, runValidators: true });
        if (!user) return next(errorHandler(401, "Failed to update surveyor"));
        res.status(200).json({ message: "Identity profile updated successfully", user , ok:true});
    }catch(error){
        next(error);
    }
});

// update profile info
export const updateProfile = asyncHandler( async(req,res,next)=>{
    try{
        const updates = req.body;
        
        if(req.file && req.file.buffer){
            const buffer = req.file.buffer.toString('base64');
            const uploadResult = await cloudinary.uploader.upload(`data:${req.file.mimetype};base64,${buffer}`,{folder: 'profile_photos'});
        }

        updates.profilePhoto = req.file.path;
        console.log("Updates to be applied:", updates);
        
        // const updates = req.body;
        if(updates.password){
            const hashPassword = await bcrypt.hashSync(updates.password,10);
            if(!hashPassword) return next(errorHandler(401,"Error hashing password"));
            updates.password = hashPassword;
        }
        const user = await Surveyor.findByIdAndUpdate(req.user.id, updates, {new:true,runValidators:true}).select('-password');        
        if(!user) return next(errorHandler(401, "Failed to update"));
        await user.save();
        res.status(200).json({message:"Profile information updated successfully",
            user,ok:true});
    }catch(error){
        next(error);
    }
})

// billing information
export const setUpBillingInfo = asyncHandler(async (req, res, next) => {
    try{
        const userId = req.user.id;
        const {firstName,lastName,country,companyTitle,city,address,postCode,email,phone} = req.body;
        const user = await Surveyor.findById(userId);
        if(!user) return next(errorHandler(404,"User not found"));
        const billingInfo = await BillingInfo.create({
            user: userId,
            firstName,lastName,country,companyTitle,city,
            address,postCode,email,phone
        });
        if(!billingInfo) return next(errorHandler(400,"Failed to create billing information"));

        await billingInfo.save();
        res.status(201).json({message:"Billing information saved successfully", billingInfo, ok:true});
    }catch(error){
        next(error);
    }

});

// update password
export const updatePassword = asyncHandler(async (req, res, next) => {
    try{
        const userId = req.user.id;
        const {currentPassword, newPassword} = req.body;
        const user = await Surveyor.findById(userId);
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
        res.status(200).json({message:"Billing information updated successfully", billingInfo: updatedBillingInfo, ok:true});
        
    }catch(error){
        next(error);
    }   
});

export const getSuveryorProfile = asyncHandler(async (req,res,next)=>{
    try{
        const surveyor = await Surveyor.findById(req.user.id).select('-password').populate('billingInfo');
        if(!surveyor) return next(errorHandler(404,"Surveyor not found"));
        res.status(200).json({surveyor});
    }catch(error){
        next(error)
    }
})

// complete surveyor profile
export const completeSurveyorProfile = asyncHandler(async (req, res, next) => {
  try {
    // const {tagline,responseTime,country,about,surveyorType,languages,yearsOfExperience,projectDetails,fileFormat,softwares,education,professionalCertifications} = req.body;
    const updates = req.body; // The frontend will send only fields being updated

    const surveyor = await Surveyor.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators:true }
    );
    if (!surveyor) {
      return next(errorHandler(404, "Surveyor profile not found"));
    }

    const profileComplete = surveyor.isProfileComplete();

    res.status(200).json({
    message: profileComplete
        ? "Profile completed. Waiting for admin approval."
        : "Profile updated but incomplete. Continue updating.",
    profileComplete,
    surveyor,
    ok:true
    });

  } catch (err) {
    next(err);
  }
});

/** Get Surveys Assigned to Surveyor **/
export const getAssignedSurveys = asyncHandler(async (req, res, next) => {
  const surveyor = await Surveyor.findById(req.user.id);

  if (!surveyor) return next(errorHandler(404, "Surveyor profile not found"));

    const surveys = await Survey.find({
        assignedSurveyor: surveyor._id,
        surveyStatus: { $in: ["assigned", "accepted", "ongoing"] }
    }).sort({ createdAt: -1 });

  res.status(200).json({ surveys });
});

// get disputes assigned to Surveyor
export const getDisputedSurveys = asyncHandler( async (req,res,next)=>{
    try{
        const disputedSurveys = await Dispute.find({
            surveyor: req.user.id
        }).sort({createdAt: -1})
        if(!disputedSurveys) return next(errorHandler(404,"No disputes available"));
        res.status(200).json({disputedSurveys})
    }catch(error){
        next(error);
    }
})

// get a disputed survey
export const getDisputedSurvey = asyncHandler( async (req,res,next)=>{
    try{
        const disputedSurvey = await Dispute.findById({
            _id: req.params.disputeId,
            surveyor: req.user.id
        }).lean()
        if(!disputedSurvey) return next(errorHandler(404,"No such dispute found"));
        res.status(200).json({disputedSurvey});
    }catch(error){
        next(error)
    }
})

// get survey by surveyor
export const getSurveyById = asyncHandler(async(req,res,next)=>{
    try{
        // const surveyor = await Surveyor.findById(req.user.id);
        // if(!surveyor) return next(errorHandler(404, "Surveyor profile not found"));
        const survey = await Survey.findOne({
        _id: req.params.surveyId,
        assignedSurveyor: req.user._id
        }).lean();

    if (!survey) {
        return next(errorHandler(404, "Survey not found"));
    }

    res.status(200).json({ survey });
    }catch(error){
        next(error);
    }
});

/** Accept Survey **/
export const acceptSurvey = asyncHandler(async (req, res, next) => {
//   const surveyor = await Surveyor.findById(req.user.id);
//   if(!surveyor) return next(errorHandler(404, "Surveyor profile not found"));

  const survey = await Survey.findById(req.params.surveyId);
  if (!survey) return next(errorHandler(404, "Survey not found"));

  if (!survey.assignedSurveyor?.equals(req.user.id)) {
    return next(errorHandler(403, "You are not assigned to this survey"));
  }

  if (survey.surveyStatus !== "assigned") {
    return next(errorHandler(400, "Survey is not awaiting acceptance"));
  }

  survey.surveyStatus = "accepted";
  survey.surveyorResponse = "accepted";
  survey.assignmentExpiresAt = null; // Clear assignment expiry
  survey.paymentDeadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // Set payment deadline to 14 days from now
  await survey.save();

  res.status(200).json({ message: "Survey accepted", survey });
});

/** Decline Survey **/
export const declineSurvey = asyncHandler(async (req, res, next) => {
//   const surveyor = await Surveyor.findOne({ user: req.user.id });

  const survey = await Survey.findById(req.params.surveyId);
  if (!survey) return next(errorHandler(404, "Survey not found"));

    if (!survey.assignedSurveyor?.equals(req.user.id)) {
        return next(errorHandler(403, "You are not assigned to this survey"));
    }

  survey.surveyorResponse = "declined";
  survey.surveyStatus = "declined";
  survey.assignmentExpiresAt = null; // Clear assignment expiry
  survey.paymentDeadline = null; // Clear payment deadline
  await survey.save();

  res.status(200).json({ message: "Survey declined" });
});

/** Start Work **/
export const startWork = asyncHandler(async (req, res, next) => {
//   const surveyor = await Surveyor.findOne({ user: req.user.id });

  const survey = await Survey.findById(req.params.surveyId);
  if (!survey) return next(errorHandler(404, "Survey not found"));

  if (!survey.assignedSurveyor?.equals(req.user.id)) {
    return next(errorHandler(403, "You are not assigned to this survey"));
  }

  if (survey.surveyStatus !== "accepted") {
    return next(errorHandler(400, "Survey must be accepted before work begins"));
  }

  if (survey.paymentStatus !== "paid") {
    return next(errorHandler(400, "Cannot start work on unpaid survey"));
  }

  survey.surveyStatus = "ongoing";
  survey.paymentDeadline = null; // Clear payment deadline
  survey.deadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Set work deadline to 30 days from now
  await survey.save();

//   res.status(200).json({ message: "Survey work started", survey });
});

/** Submit Completed Work **/
export const submitWork = asyncHandler(async (req, res, next) => {
//   const surveyor = await Surveyor.findOne({ user: req.user.id });

  const { deliveryNotes, files } = req.body; // files: [{fileName, fileUrl}]
  const survey = await Survey.findById(req.params.surveyId);

  if (!survey) return next(errorHandler(404, "Survey not found"));

  if (!survey.assignedSurveyor?.equals(req.user.id)) {
    return next(errorHandler(403, "You are not assigned to this survey"));
  }

  if (survey.surveyStatus !== "ongoing") {
    return next(errorHandler(400, "Survey must be ongoing to submit work"));
  }

  survey.workSubmission = { deliveryNotes, files };
  survey.surveyStatus = "submitted";
  survey.deadline = null; // Clear work deadline
  await survey.save();
  res.status(200).json({ message: "Work submitted, awaiting client approval", survey });
});

// "languages": [{"language": "English"}, {"language": "Spanish"}],
//     "yearsOfExperience": 10,
//     "projectDetails": "Completed over 100 projects successfully.",
//     "fileFormat": [{"fileType": "PDF"}, {"fileType": "DWG"}],
//     "softwares": [{"name": "AutoCAD"}, {"name": "GIS"}],
//     "professionalCertifications":[
//         {
//             "certificateName": "Certified Surveyor",
//         }
//     ],
// "education": [
//         {
//             "title": "B.Sc. in Geomatics",
//             "institutionName": "University of Surveying",
//             "dateFrom": "2010-09-01",
//             "dateTo": "2014-06-30",
//             "description": "Studied various surveying techniques and technologies."
//         }
//     ],