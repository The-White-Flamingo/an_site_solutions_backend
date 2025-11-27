import mongoose from "mongoose";

const surveySchema = new mongoose.Schema({
    title: { type: String, required: true },
    budget: {type: Number, required: true},
    location: { type: String, required: true},
    additionalNotes: { type: String, required: false },
    documents: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Document'
        }
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedSurveyor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    adminApproval: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
    surveyorResponse: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
    status: {
        type: String,
        enum: [
        "pending_approval",
        "awaiting_payment",
        "ongoing",
        "completed",
        "under_review",
        "approved",
        "disputed",
        "expired",
        "cancelled",
        ],
        default: "pending_approval",
    },
    paymentStatus: {
        type: String,
        enum: ["unpaid", "paid", "expired"],
        default: "unpaid",
    },
    paymentDeadline: { type: Date },
    deadline: { type: Date, required: false },
    payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment'
    },
    dispute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dispute'
    },
    createdAt: { type: Date, default: Date.now },
    completedAt: { type: Date }
});

export default mongoose.model("Survey", surveySchema);