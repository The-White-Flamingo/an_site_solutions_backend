import mongoose from "mongoose";

const disputeSchema = new mongoose.Schema({
    survey: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey', required: true },
    raiseBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    raisedAgainst: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, enum: ["Surveyor unresponsive", "Incomplete work", "False results", "Other"], required: true },
    explanation: { type: String, required: true },
    evidence: [
        { 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Document'
        }
    ],
    resolutionPreference: {
        type: String,
        enum: ["Refund", "Redo survey", "Rework by surveyor", "Mediation", "Other"],
        required: true,
    },
    status: {
        type: String,
        enum: ["open", "resolved", "rejected"],
        default: "open",
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Dispute", disputeSchema);