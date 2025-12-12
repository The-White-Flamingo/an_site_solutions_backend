import asyncHandler from "express-async-handler";
import { errorHandler } from "../config/errorHandler.js";
import Surveyor from "../models/Surveyor.js";
import Survey from "../models/Survey.js";
import Dispute from "../models/Dispute.js";
import User from "../models/User.js";

// signup
export const signup = asyncHandler(async (req,res,next)=>{

})

// login
export const login = asyncHandler(async (req,res,next)=>{

})

// logout
export const logout = asyncHandler(async (req,res,next)=>{

})

/** Approve or Reject Surveyor Profile **/
export const approveSurveyor = asyncHandler(async (req, res, next) => {
  const { surveyorId } = req.params;
  const { approve } = req.body; // true or false

  const surveyor = await Surveyor.findById(surveyorId).populate("user");
  if (!surveyor) return next(errorHandler(404, "Surveyor not found"));

  surveyor.approved = approve;
  await surveyor.save();

  res.status(200).json({
    message: approve ? "Surveyor approved" : "Surveyor rejected",
    surveyor
  });
});

/** Approve Survey **/
export const approveSurvey = asyncHandler(async (req, res, next) => {
  const { surveyId } = req.params;

  const survey = await Survey.findById(surveyId);
  if (!survey) return next(errorHandler(404, "Survey not found"));

  survey.adminStatus = "approved";
  await survey.save();

  res.status(200).json({ message: "Survey approved", survey });
});

/** Assign Survey to Surveyor **/
export const assignSurvey = asyncHandler(async (req, res, next) => {
  const { surveyorId, surveyId } = req.params;
  const { deadline } = req.body; // date string

  const survey = await Survey.findById(surveyId);
  if (!survey) return next(errorHandler(404, "Survey not found"));

  const surveyor = await Surveyor.findById(surveyorId);
  if (!surveyor || !surveyor.approved)
    return next(errorHandler(400, "Surveyor is not approved"));

  survey.assignedSurveyor = surveyorId;
  survey.assignmentExpiresAt = new Date(deadline);
  survey.surveyStatus = "assigned";
  await survey.save();

  surveyor.acceptedSurveys.push(survey._id);
  await surveyor.save();

  res.status(200).json({ message: "Survey assigned successfully", survey });
});

/** Get All Surveys **/
export const getAllSurveys = asyncHandler(async (req, res, next) => {
  const surveys = await Survey.find().populate("user assignedSurveyor");
  res.status(200).json(surveys);
});

/** Get All Surveyors **/
export const getAllSurveyors = asyncHandler(async (req, res, next) => {
  const surveyors = await Surveyor.find().populate("user");
  res.status(200).json(surveyors);
});

/** View All Disputes **/
export const viewDisputes = asyncHandler(async (req, res, next) => {
  const disputes = await Dispute.find().populate("survey user surveyor");
  res.status(200).json(disputes);
});
