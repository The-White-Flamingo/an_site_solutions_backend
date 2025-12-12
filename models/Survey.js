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
      fileName: { type: String },
      fileUrl: { type: String }
    }
  ],

  paymentStatus: {
    type: String,
    enum: ["unpaid", "paid", "expired"],
    default: "unpaid"
  },

  paymentDeadline: { type: Date,
    required: false,
    default: null
    // default: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 2 week from creation
  },

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

  deadline: { type: Date,
    required: false,
    default: null
    // default: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000) // 4 weeks from creation
   },

  assignedSurveyor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Surveyor",
    default: null
  },

  assigned:{
    type: Boolean,
    default: false
  },

  assignmentExpiresAt: {
    type: Date,
    default: null
    // default: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1week from creation
  },

  surveyStatus: {
    type: String,
    enum: [
      "pending_admin_approval", 
      "approved", 
      "rejected",
      "assigned",
      "accepted",
      "ongoing",
      "submitted",
      "completed",
      "disputed",
      "requested"
    ],
    default: "pending_admin_approval"
  },

  workSubmission: {
  deliveryNotes: { type: String, default: "" },
  files: [
    {
      fileName: { type: String, required: true },
      fileUrl: { type: String, required: true }
    }
  ]
},

  createdAt: { type: Date, default: Date.now }
});

const Survey = model("Survey", SurveySchema);
export default Survey;
