import User from "../models/User.js";
import { errorHandler } from "../config/errorHandler.js";
// import dotenv from "dotenv";
import Survey from "../models/Survey.js";
// import Dispute from "../models/Dispute.js";
import asyncHandler from "express-async-handler";
import SurveyorProfile from "../models/SurveyorProfile.js";

export const getAllSurveys = asyncHandler(async (req,res,next)=>{
    try{
        if(req.user.role !== "admin") return next(errorHandler(401, "Only admins can view all surveys"));
        const surveys = await Survey.find().populate('createdBy',"firstName lastName email").populate("assignedSurveyor","firstName lastName email");
        if(!surveys) return next(errorHandler(401, "No surveys available"));
        res.status(200).json({count: surveys.length,surveys});
    }catch(err){
        next(err);
    }
})

export const getSurveyById = asyncHandler( async(req,res,next)=>{
    try{
        if(req.user.role !== "admin") return next(errorHandler(401, "Only admins can view"));
        const survey = await Survey.findOne({
            _id: req.params.surveyId,
        });

        if (!survey) {
            return next(errorHandler(404, "Survey not found"));
        }
        
        res.status(200).json({ survey });
    }catch(err){
        next(err);
    }
})

export const approveSurvey = asyncHandler( async(req,res,next)=>{
    try{
        if(req.user.role !== "admin") return next(errorHandler(403, "Unauthorized, only admins are allowed."));

        const {surveyId} = req.params;
        const { surveyorId, approved, paymentDays} = req.body;

        const survey = await Survey.findById(surveyId);
        if(!survey) return next(errorHandler(404, "No survey found"));

        if(approved === "approved"){
            const paymentDeadline = new Date(Date.now() + (paymentDays || 3) * 24 * 60 * 1000);

            survey.adminApproval = "approved";
            survey.status = "awaiting_payment";
            survey.assignedSurveyor = surveyorId;
            survey.paymentDeadline = paymentDeadline;
            survey.approvedAt = new Date();
        }else if(approved === "rejected"){
            survey.adminApproval = "rejected";
            survey.status = "cancelled";
        }else{
            return next(errorHandler(400, "Invalid approval type"))
        }

        await survey.save();
        res.status(200).json({
            message: `Survey ${approved} successfully`,
            survey
        });
        // if(req.user.role !== "admin") return next(errorHandler(401, "Unauthorized"));
        // const surveyExist = await Survey.findByIdAndUpdate(req.params.surveyId,{
        //     status: "approved",
        //     paymentStatus: "unpaid",
        //     paymentDeadline: "1 week"
        // },
        // {
        //     new: true,
        //     runValidators: true
        // });
        // if(!surveyExist) return next(errorHandler(500, "No such survey exist"));
        // res.status(201).json({message:"Survey approved"})
    }catch(err){
        next(err);
    }
})

export const approveSurveyor = asyncHandler(async(req,res,next)=>{
    try{
        if(req.user.role !== "admin") return next(errorHandler(403, "Unauthorized, only admins are allowed."));

        const {surveyorId,approval} = req.body;

        const surveyor = await SurveyorProfile.findById({surveyorId},"-password").populate('user','firstName lastName email phoneNumber role');
        if(!surveyor || surveyor.role !== "surveyor") return next(errorHandler(404, "Surveyor not found"));

        if(approval === "approved"){
            surveyor.isApproved = true;
        }else if(approval === "rejected"){
            surveyor.isApproved = false;
        }else{
            return next(errorHandler(400, "Invalid approval type"))
        }

        await surveyor.save();
        res.status(200).json({
            message: `Surveyor ${approval} successfully`,
            surveyor
        })
    }catch(err){
        next(err);
    }
})

export const resolveDispute = asyncHandler( async(req,res,next)=>{
    try{
        if(req.user.role !== "admin") return next(errorHandler(403, "Unauthorized, only admins are allowed."));

        const {surveyId} = req.params;
        const { resolutionNote, newStatus} = req.body;

        const survey = await Survey.findById(surveyId);
        if(!survey || !survey.dispute){
            return next(errorHandler(404, "No active dispute found for this survey"));
        }

        survey.dispute.status = "resolved";
        survey.dispute.resolutionNote = resolutionNote;
        survey.dispute.resolvedAt = new Date();
        survey.status = newStatus || "approved";

        await survey.save();
        res.status(200).json({
            message: "Dispute resolved successfully",
            survey,
        })
    }catch(err){
        next(err)
    }
})

export const getAllClient = asyncHandler(async (req, res, next)=>{
    try{
        if(req.user.role !== "admin") return next(errorHandler(403, "Unauthorized, only admins are allowed."));

        const users = await User.find({}, "-password").populate('user','firstName lastName email password role');
        if(!users) return next(errorHandler(404, "No users available"));

        res.status(200).json({
            message:"All clients",
            users
        })
    }catch(err){
        next(err);
    }
})

export const getAllSurveyors = asyncHandler( async(req,res,next)=>{
    try{
        if(req.user.role !== "admin") return next(errorHandler(403, "Unauthorized, only admins are allowed."));

        const users = await SurveyorProfile.find({}, "-password").populate('user','firstName lastName email password role');
        if(!users) return next(errorHandler(404, "No users available"));

        res.status(200).json({
            message: "All surveyors",
            users
        })
    }catch(err){
        next(err)
    }
})

export const getSurveyorById = asyncHandler(async(req,res,next)=>{
    try{
        if(req.user.role !== "admin") return next(errorHandler(403, "Unauthorized, only admins are allowed."));
        const {userId} = req.params;
        const surveyorExists = await SurveyorProfile.findById(userId).populate('user','firstName lastname email phoneNumber role');
        if(!surveyorExists) return next(errorHandler(404, "No such user exists"));

        res.status(200).json({
            surveyorExists
        })
    }catch(err){
        next(err);
    }
})

export const deactivateUser = asyncHandler( async(req,res,next)=>{
    try{
        const { userId } = req.params;
        const user = await User.findById(userId);
        if(!user) return next(errorHandler(404, "No such user"));

        user.isActive = false;
        await user.save();

        res.status(200).json({
            message: "User deactivated successfully",
            user,
        })
    }catch(err){
        next(err);
    }
})