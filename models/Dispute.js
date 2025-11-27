import mongoose, {Schema, model} from "mongoose";

const DisputeSchema = new Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    surveyor:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Surveyor",
    },
    survey:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Survey",
    },
    reason: { type: String, enum: ["Incorrect Charge", "Survey quality work", "Survey not complete", "Delayed service"], required: true },
    explanation: { type: String, required: true },
    evidence: [{
        file:{type: String}
    }],
    resolutionPreference: {
        type: String,
        enum: ["Refund", "Redo survey", "Rework by surveyor", "Mediation", "Other"],
        required: true,
    },
    status: {
        type: String,
        enum: ["pending_review", "resolved", "cancelled"],
        default: "pending_review",
    },
    comments:[{
        type: mongoose.Schema.Types.ObjectId, ref: 'Comment',
        required: false
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Dispute = model("Review",DisputeSchema);
export default Dispute;