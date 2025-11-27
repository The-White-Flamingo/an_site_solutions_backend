import Dispute from '../models/Dispute.js';
import Survey from '../models/Survey.js';
import asyncHandler from 'express-async-handler';
import { errorHandler } from '../config/errorHandler.js';
import Document from '../models/Documents.js';


// 🟢 RAISE DISPUTE (Client)
export const raiseDispute = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "client") {
    return next(errorHandler(401, "Only clients can raise disputes"));
  }

  const { reason, description, evidence, resolutionPreference } = req.body;

  const createDocuments = async (evidenceArray) => {
    const documentIds = [];
    for (const doc of evidenceArray) {
      const newDoc = new Document({
        name: doc.name,
        url: doc.url,
        type: doc.type,
      });
      await newDoc.save();
      documentIds.push(newDoc._id);
    }
    return documentIds;
  };

  const documentIds = await createDocuments(evidence);  

  // create a new dispute
  const newDispute = new Dispute({
    survey: req.params.surveyId,
    raisedBy: req.user.id,
    reason,
    description,
    evidence: documentIds,
    resolutionPreference,
  });

  if (!newDispute) {
    return next(errorHandler(400, "Invalid dispute data"));
  }
  await newDispute.save();

  // associate dispute with survey
  const survey = await Survey.findByIdAndUpdate(req.params.surveyId, {
    status: "disputed",
    dispute: newDispute._id,
  });
  
  // const survey = await Survey.findOne({
  //   _id: req.params.surveyId,
  //   createdBy: req.user.id,
  // });

  // if (!survey) {
  //   return next(errorHandler(404, "Survey not found"));
  // }

  // survey.status = "disputed";
  // survey.dispute = {
  //   reason,
  //   description,
  //   evidence,
  //   resolutionPreference,
  //   raisedBy: req.user.id,
  //   raisedAt: new Date(),
  // };

  await survey.save();

  res.status(200).json({
    message: "Dispute raised successfully",
    dispute: survey.dispute,
  });
});

export const getDisputeDetails = asyncHandler(async (req, res, next) => {
  try {
    const { surveyId } = req.params;
    const survey = await Survey.findById(surveyId).populate({
        path: 'dispute',
        populate: {
            path: 'evidence',
            model: 'Document',
        },
    });
    if (!survey || !survey.dispute) {
      return next(errorHandler(404, "No dispute found for this survey"));
    }
    res.status(200).json({
      message: "Dispute details fetched successfully",
      dispute: survey.dispute,
    });
  } catch (err) {
    next(err);
  }
});

export const getAllDisputes = asyncHandler(async (req, res, next) => {
  try {
    if (req.user.role !== "client" && req.user.role !== "admin") {
      return next(errorHandler(403, "Unauthorized, only clients and admins are allowed."));
    }
    const disputes = await Dispute.find().populate('survey').populate('raisedBy').populate('raisedAgainst').populate('evidence');
    res.status(200).json({
      message: "All disputes fetched successfully",
      disputes,
    });
  } catch (err) {
    next(err);
  }
});

export const getUserDisputes = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user.id;
    const disputes = await Dispute.find({
      $or: [{ raisedBy: userId }, { raisedAgainst: userId }],
    }).populate('survey').populate('raisedBy').populate('raisedAgainst').populate('evidence');
    res.status(200).json({
      message: "User disputes fetched successfully",
      disputes,
    });
  } catch (err) {
    next(err);
  }
});