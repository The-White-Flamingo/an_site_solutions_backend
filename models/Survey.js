// import mongoose, {Schema, model} from "mongoose";

// const SurveySchema = new Schema({
//     user:{
//         type: Schema.Types.ObjectId, ref:"User", required: true
//     },
//     // surveyor:{
//     //     type: Schema.Types.ObjectId, ref:"User", required: false
//     // },
//     title: { type: String, required: true },
//     budget: {type: Number, required: true},
//     location: { type: String, required: true},
//     additionalNotes: { type: String, required: false },
//     documents: [
//         {
//             file:{type: String}
//         }
//     ],
//     // status: {
//     //     type: String,
//     //     enum: [
//     //     "pending_approval",
//     //     "awaiting_payment",
//     //     "ongoing",
//     //     "completed",
//     //     "awaiting_client_approval",
//     //     "approved",
//     //     "disputed",
//     //     "expired",
//     //     "cancelled",
//     //     ],
//     //     default: "pending_approval",
//     // },
//     paymentStatus: {
//         type: String,
//         enum: ["unpaid", "paid", "expired"],
//         default: "unpaid",
//     },
//     paymentDeadline: { type: Date },
//     // deadline: { type: Date, required: false },
//     dispute: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'Dispute'
//     },
//     surveyorResponse: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
//     adminStatus: {
//         type: String,
//         enum: ["pending", "approved", "rejected"],
//         default: "pending"
//     },
//     assignedSurveyor: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Surveyor",
//         default: null
//     },
//     assignmentExpiresAt: {
//         type: Date,
//         default: null
//     },
//     surveyStatus: {
//         type: String,
//         enum: ["pending", "assigned", "ongoing", "completed"],
//         default: "pending"
//     },
//     createdAt: {type: Date, default: Date.now}
// });

// const Survey = model("Survey", SurveySchema);

// export default Survey;

import mongoose, { Schema, model } from "mongoose";

const SurveySchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  title: { type: String, required: true },
  budget: { type: Number, required: true },
  location: { type: String, required: true },
  additionalNotes: { type: String },

  documents: [
    {
      file: { type: String }
    }
  ],

  paymentStatus: {
    type: String,
    enum: ["unpaid", "paid", "expired"],
    default: "unpaid"
  },
  paymentDeadline: { type: Date },

  dispute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Dispute"
  },

  surveyorResponse: {
    type: String,
    enum: ["pending", "accepted", "declined"],
    default: "pending"
  },

  adminStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },

  assignedSurveyor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Surveyor",
    default: null
  },

  assignmentExpiresAt: {
    type: Date,
    default: null
  },

  surveyStatus: {
    type: String,
    enum: [
      "pending",
      "assigned",
      "accepted",
      "declined",
      "ongoing",
      "submitted",
      "completed"
    ],
    default: "pending"
  },

  workSubmission: {
    deliveryNotes: { type: String },
    files: [
      {
        fileName: { type: String },
        fileUrl: { type: String }
      }
    ]
  },

  createdAt: { type: Date, default: Date.now }
});

const Survey = model("Survey", SurveySchema);
export default Survey;
