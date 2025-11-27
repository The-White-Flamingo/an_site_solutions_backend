import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    residentialAddress: {
        type: String,
        required: true,
    },
    postalAddress: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'client', 'surveyor',],
        default: 'client'
    },
    isActive:{
        type: Boolean,
        default: true
    },
    surveyorProfile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SurveyorProfile'
    },
    createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('User', UserSchema);
// End of file models/User.js