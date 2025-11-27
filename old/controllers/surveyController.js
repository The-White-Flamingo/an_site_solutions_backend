import Survey from '../models/Survey.js';
import asyncHandler from 'express-async-handler';
import { errorHandler } from '../config/errorHandler.js';
import Document from '../models/Documents.js';

// export const createSurvey = asyncHandler(async (req, res, next) => {
//     try{
//         if(req.user.id !== req.params.userId){
//             res.status(401);
//             throw new Error('User not authorized to create survey for this user');
//         }
//         if(req.user.role !== 'client'){
//             res.status(401);
//             throw new Error('Only clients can create surveys');
//         }
//         const { title, budget, location, additionalNotes, documents, deadline } = req.body;

//         const survey = new Survey({
//             title,
//             budget,
//             location,
//             additionalNotes,
//             documents,
//             createdBy: req.user.id,
//             deadline
//         });
//         if(!survey){
//             return next(errorHandler(400, 'Invalid survey data'));
//         }
//         await survey.save();
//         res.status(201).json(survey);
//     }catch(err){
//         next(err);
//     }
    
// });

// export const getSurveysByClient = asyncHandler(async (req, res, next) => {
//     try{
//         if(req.user.id !== req.params.userId){
//             res.status(401);
//             throw new Error('User not authorized to view surveys for this user');
//         }
//         if(req.user.role !== 'client'){
//             res.status(401);
//             throw new Error('Only clients can view their surveys');
//         }
//         const surveys = await Survey.find({ createdBy: req.user.id });
//         if(!surveys){
//             return next(errorHandler(404, 'No surveys found for this client'));
//         }
//         res.status(200).json({
//             surveys
//         });
//     }catch(err){
//         next(err);
//     }
// });

// export const getAllSurveys = asyncHandler(async (req, res, next) => {
//     try{
//         if(req.user.id !== req.params.userId){
//             res.status(401);
//             throw new Error('User not authorized to view all surveys');
//         }
//         if(req.user.role !== 'admin'){
//             res.status(401);
//             throw new Error('Only admins can view all surveys');
//         }
        
//         const surveys = await Survey.find();
//         if(!surveys){
//             return next(errorHandler(404, 'No surveys found'));
//         }
//         res.status(200).json({
//             surveys
//         });
//     }catch(err){
//         next(err);
//     }
// });

// export const getSurveyById = asyncHandler(async (req, res, next) => {
//     try{
//         if(req.user.id !== req.params.userId){
//             res.status(401);
//             throw new Error('User not authorized to view this survey');
//         }
//         if(req.user.role !== 'client'){
//             res.status(401);
//             throw new Error('Only clients can view their surveys');
//         }
//         const survey = await Survey.findById(req.params.surveyId);
//         if(!survey){
//             return next(errorHandler(404, 'Survey not found'));
//         }
//         res.status(200).json({
//             survey
//         });
//     }catch(err){
//         next(err);
//     }
// });


// 🟢 CREATE SURVEY (Client)
export const createSurvey = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "client") {
    return next(errorHandler(401, "Only clients can create surveys"));
  }

  const { title, budget, location, additionalNotes, documents, deadline } = req.body;

  const documentIds = [];
  for(let doc of documents){
    if(!doc.name || !doc.url || !doc.type){
      return next(errorHandler(400, "Document data incomplete"));
    }
    const newDoc = new Document({
      name: doc.name,
      url: doc.url,
      type: doc.type,
    });
    if(!newDoc) return next(errorHandler(400, "Invalid document data"));
    await newDoc.save();
    documentIds.push(newDoc._id);
  }

  const survey = new Survey({
    title,
    budget,
    location,
    additionalNotes,
    $push: { documents: { $each: documentIds } },
    createdBy: req.user.id,
    deadline,
    status: "pending_approval",
  });

  if (!survey) return next(errorHandler(404, "Failed to create survey"));

  await survey.save();

  // doc.surveyProject = survey._id;
  for(let id of documentIds){
    const document = await Document.findByIdAndUpdate(id, { surveyProject: survey._id });
    // document.surveyProject = survey._id;
    await document.save();
  }

  console.log(survey.documents);
  res.status(201).json({
    message: "Survey created successfully",
    survey,
  });
});

// 🟢 GET CLIENT’S SURVEYS
export const getSurveysByClient = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "client") {
    return next(errorHandler(401, "Only clients can view their surveys"));
  }

  const surveys = await Survey.find({ createdBy: req.user.id });

  if (!surveys.length) {
    return next(errorHandler(404, "No surveys found for this client"));
  }

  res.status(200).json({ surveys });
});

// 🟢 GET ALL SURVEYS (Admin)
export const getAllSurveys = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(errorHandler(401, "Only admins can view all surveys"));
  }

  const surveys = await Survey.find().populate("createdBy assignedSurveyor");

  res.status(200).json({ surveys });
});

// 🟢 GET SINGLE SURVEY (Client)
export const getSurveyById = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "client") {
    return next(errorHandler(401, "Only clients can view their surveys"));
  }

  const survey = await Survey.findOne({
    _id: req.params.surveyId,
    createdBy: req.user.id,
  });

  if (!survey) {
    return next(errorHandler(404, "Survey not found"));
  }

  res.status(200).json({ survey });
});

export const updateSurveyById = asyncHandler( async(req,res,next)=>{
  try{
    if(req.user.role !== "client") return next(errorHandler(403, "Unauthorized"));

    const {title,budget,location,additionalNotes,documents,deadline} = req.body;

    const survey = await Survey.findById(req.params.surveyId);
    if(!survey) return next(errorHandler(404, "No survey found"));
    const documentExists = await Document.findById(survey.documents);
    if(!documentExists) return next(errorHandler(404, "No document found"));

    // update document fields
    documentExists.name = documents.name || documentExists.name;
    documentExists.url = documents.url || documentExists.url;
    documentExists.type = documents.type || documentExists.type;
    await documentExists.save();

    // update survey fields
    survey.title = title || survey.title;
    survey.budget = budget || survey.budget;
    survey.location = location || survey.location;
    survey.additionalNotes = additionalNotes || survey.additionalNotes;
    survey.deadline = deadline || survey.deadline;
    await survey.save();
    // const surveyExists = await Survey.findByIdAndUpdate({createdBy: req.params.userId},{
    //   title,
    //   budget,
    //   location,
    //   additionalNotes,
    //   $push:{documents: {$each: documents}},
    //   deadline
    // })
    
  }catch(err){
    next(err);
  }
})


// export const raiseDispute = asyncHandler(async (req, res, next) => {
//     try{
//         if(req.user.id !== req.params.userId){
//             res.status(401);
//             throw new Error('User not authorized to raise a dispute for this survey');
//         }
//         if(req.user.role !== 'client'){
//             res.status(401);
//             throw new Error('Only clients can raise disputes for their surveys');
//         }
//         const {reason, explanation, evidence, resolutionPreference} = req.body;
//         const newDispute = await Dispute({
//             survey: req.params.surveyId,
//             raisedBy: req.user.id,
//             raisedAgainst: req.body.raisedAgainst,
//             reason,
//             explanation,
//             evidence,
//             resolutionPreference,
//         });
//         if(!newDispute){
//             return next(errorHandler(400, 'Invalid dispute data'));
//         }
//         await newDispute.save();
//         // Logic to raise a dispute
//         res.status(200).json({
//             message: 'Dispute raised successfully',
//             dispute: newDispute
//         });
//     }catch(err){
//         next(err);
//     }
// });


// // 🟢 RAISE DISPUTE (Client)
// export const raiseDispute = asyncHandler(async (req, res, next) => {
//   if (req.user.role !== "client") {
//     return next(errorHandler(401, "Only clients can raise disputes"));
//   }

//   const { reason, description, evidence, resolutionPreference } = req.body;
//   // create a new dispute
//   const newDispute = new Dispute({
//     survey: req.params.surveyId,
//     raisedBy: req.user.id,
//     reason,
//     description,
//     evidence,
//     resolutionPreference,
//   });

//   if (!newDispute) {
//     return next(errorHandler(400, "Invalid dispute data"));
//   }
//   await newDispute.save();

//   // associate dispute with survey
//   const survey = await Survey.findByIdAndUpdate(req.params.surveyId, {
//     status: "disputed",
//     dispute: newDispute._id,
//   });
  
//   // const survey = await Survey.findOne({
//   //   _id: req.params.surveyId,
//   //   createdBy: req.user.id,
//   // });

//   // if (!survey) {
//   //   return next(errorHandler(404, "Survey not found"));
//   // }

//   // survey.status = "disputed";
//   // survey.dispute = {
//   //   reason,
//   //   description,
//   //   evidence,
//   //   resolutionPreference,
//   //   raisedBy: req.user.id,
//   //   raisedAt: new Date(),
//   // };

//   await survey.save();

//   res.status(200).json({
//     message: "Dispute raised successfully",
//     dispute: survey.dispute,
//   });
// });

