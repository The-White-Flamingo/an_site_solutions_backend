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
        fileName:{type: String},
        fileUrl:{type: String},
    }],
    resolutionPreference: {
        type: String,
        enum: ["Pending","Refund", "Redo survey", "Rework by surveyor", "Mediation", "Other"],
        required: true,
        default: "Pending"
    },
    status: {
        type: String,
        enum: ["Pending", "Resolved", "Cancelled", "Under Review"],
        default: "Pending",
    },
    comments:[{
        type: mongoose.Schema.Types.ObjectId, ref: 'Comment',
        required: false
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Dispute = model("Dispute",DisputeSchema);
export default Dispute;