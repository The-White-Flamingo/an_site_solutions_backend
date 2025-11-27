import Survey from "../models/Survey.js"
import { errorHandler } from "../config/errorHandler.js"
import asyncHandler from "express-async-handler";

// create new survey
export const createSurvey = asyncHandler( async(req,res,next)=>{
    try{
        const userId = req.user.id;
        const {
            title,budget,
            location,additionalNotes,
            documents
        } = req.body;

        const createSurvey = await Survey.create({
            user: userId,
            title,
            budget,
            location,
            additionalNotes,
            documents
            // $push: { documents: documents}
            // createdAt: createdAt || Date.now
        })
        if(!createSurvey) return next(errorHandler(401, "Failed to create survey"));
        // await createSurvey.save();

        res.status(200).json({
            message: "Survey created successfully",
            createSurvey
        })
    }catch(error){
        next(error)
    }
})

// update survey
export const updateSurveyById = asyncHandler(async(req,res,next)=>{
    try{
        const {
            title,budget,
            location,additionalNotes,documents
        } = req.body;

        const updateSurvey = await Survey.findByIdAndUpdate(req.params.surveyId,{
            title,
            budget,
            location,
            additionalNotes,
            ...(documents && { $push: { documents: { $each: documents } } })
        },{new:true,runValidators:true});
        if(!updateSurvey) return next(errorHandler(403, "Failed to update survey"));
        // await updateSurvey.save()

        res.status(200).json({
            message: "Survey updated successfully",
            updateSurvey
        })
    }catch(error){
        next(error);
    }
})

// get survey by client
export const getSurveysByClient = asyncHandler(async(req,res,next)=>{
    try{
        const surveys = await Survey.find({user: req.user.id}).sort({createdAt: -1}).lean();
        if(!surveys) return next(errorHandler(404, "No surveys found for this client"));

        res.status(200).json({surveys})
    }catch(error){
        next(error);
    }
})

// get a survey by client
export const getSurveyById = asyncHandler(async(req,res,next)=>{
    try{
        const survey = await Survey.findOne({
        _id: req.params.surveyId,
        user: req.user.id,
        }).lean();
    
        if (!survey) {
            return next(errorHandler(404, "Survey not found"));
        }
    
        res.status(200).json({ survey });
    }catch(error){
        next(error);
    }
})

// get all surveys
export const getSurveys = asyncHandler(async(req,res,next)=>{
    try{
        const surveys = await Survey.find().populate("user","firstName lastName email").populate("assignedSurveyor","tagline country responseTime yearsOfExperience").sort({createdAt: -1}).lean();
        
        res.status(200).json({ surveys });
    }catch(error){
        next(error);
    }
})