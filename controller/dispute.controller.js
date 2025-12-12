import Dispute from "../models/Dispute.js";
import Comment from "../models/Comment.js";
import Survey from "../models/Survey.js";
import {errorHandler} from "../config/errorHandler.js";
import asyncHandler from "express-async-handler";

// raise dispute (client)
export const raiseDispute = asyncHandler( async(req,res,next)=>{
    try{
        const survey = await Survey.findOne({_id: req.params.surveyId, user: req.user.id});
        if(!survey) return next(errorHandler(404, "No such survey found"));

        if(survey.status === "completed" || survey.status === "paid" || survey.status === "cancelled" || survey.status === "disputed" || survey.status === "resolved" || survey.assigned || survey.paymentDeadline < Date.now()){
            return next(errorHandler(400, "Cannot raise dispute on completed or paid surveys"));
        }
        const {reason,explanation,surveyorId,evidence,resolutionPreference} = req.body;
        const dispute = await Dispute.create({
            user: req.user.id,
            surveyor: surveyorId,
            survey: req.params.surveyId,
            reason,
            explanation,
            evidence,
            resolutionPreference
        });
        if(!dispute) return next(errorHandler(401,"Failed to raise dispute"));
        survey.surveyStatus = "disputed";
        await survey.save();

        await dispute.save();
        res.status(200).json({
            message: "Dispute raised successfully",
            dispute
        });
    }catch(error){
        next(error);
    }
})
// resolve dispute (admin)
export const resolveDispute = asyncHandler( async(req,res,next)=>{
    try{
        const {resolution} = req.body;
        const dispute = await Dispute.findById(req.params.disputeId).populate('survey');
        const survey = await Survey.findOne({dispute: req.params.disputeId});
        if(!dispute) return next(errorHandler(404, "No such dispute"));
        if(!survey) return next(errorHandler(404, "No such survey"));

        if(resolution === "cancel"){
            dispute.status = "cancelled";
            await dispute.save();
            return res.status(200).json({
                message: "Dispute cancelled"
            });
        }
        if(dispute.resolutionPreference === "Refund"){
            const survey = await Survey.findByIdAndUpdate({dispute: req.params.disputeId},{status: "cancelled"},{new:true});
            // survey.status = "cancelled";
            dispute.status = "resolved";
            await dispute.save();
            await survey.save();

            return res.status(200).json({
                message: "Dispute resolved"
            });
        }
    }catch(error){
        next(error);
    }
})
// cancel dispute (admin/client)
export const cancelDispute = asyncHandler( async(req,res,next)=>{
    try{
        const dispute = await Dispute.findByIdAndUpdate(req.params.disputeId,{status:"cancelled"});
        if(!dispute) return next(errorHandler(404, "No such dispute found"));
        res.status(200).json({
            message:"Dispute Cancelled",
            dispute,
            ok: true
        });
        const survey = await Survey.findById(dispute.survey);
        survey.surveyStatus = "ongoing";
        survey.deadline = Date.now() + 7*24*60*60*1000; // extend deadline by 7 days
        await survey.save();
    }catch(error){
        next(error);
    }
})
// add comment (client)
export const commentDispute = asyncHandler( async(req,res,next)=>{
    try{
        const {content} = req.body;
        const comment = new Comment({content,user:req.user.id,dispute:req.params.disputeId});
        if(!comment) return errorHandler(401,"Failed to add comment");
        const survey = await Survey.findByIdAndUpdate(req.params.disputeId,{$push: {comments: comment._id}},{
            new: true,
            runValidators: true
        })
        if(survey) return errorHandler(401,"Failed to add comment");
        await comment.save();
        await survey.save();

        res.status(200).json({
            message: "Comment added successfully",
            comment
        })
    }catch(error){
        next(error);
    }
})
// get disputes by client (client)
export const clientDisputes = asyncHandler( async(req,res,next)=>{
    try{
        const disputes = await Dispute.find({user: req.user.id})
        .populate("survey surveyor");
        if(!disputes) return next(errorHandler(404, "No disputes found"));
        res.status(200).json({
            disputes
        });
    }catch(error){
        next(error);
    }
})
// get dispute by client (client/admin)
export const disputeByClient = asyncHandler( async(req,res,next)=>{
    try{
        const disputes = await Dispute.findById({_id:req.params.disputeId,user: req.user.id}).populate("survey surveyor");
        if(!disputes) return next(errorHandler(404, "No dispute found"));
        res.status(200).json({
            disputes
        });
    }catch(error){
        next(error);
    }
})
// get disputes (admin)
export const disputes = asyncHandler( async(req,res,next)=>{
    try{
        const disputes = await Dispute.find().populate("user survey");
        if(!disputes) return next(errorHandler(404, "No disputes found"));
    }catch(error){
        next(error);
    }
})