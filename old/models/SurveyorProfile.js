// models/SurveyorProfile.js
import mongoose from "mongoose";

const surveyorProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  tagline: String,
  hourlyRate: Number,
  country: String,
  about: String,
  typeOfSurveyor: String, // e.g., Land, Building, Quantity
  languages: [String],
  yearsOfExperience: Number,
  minimumBookingFee: Number,

  education: [
    {
      title: String,
      institution: String,
      startDate: Date,
      endDate: Date,
      description: String
    }
  ],

  certifications: [
    {
      name: String,
      issuingOrganization: String,
      issueDate: Date,
      credentialId: String,
      credentialUrl: String
    }
  ],

  associations: [
    {
      name: String,
      role: String,
      since: Date
    }
  ],
  isApproved:{
    type: Boolean,
    default: false
  },
  reviews: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reviews"
  },
  totalProjects: { type: Number, default: 0 },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("SurveyorProfile", surveyorProfileSchema);
// End of file models/SurveyorProfile.js