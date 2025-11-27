import mongoose, { Schema } from "mongoose";

const reviewsSchema = new Schema({
    surveyor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SurveyorProfile",
    },
    review: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }]
})

export default mongoose.model("Reviews",reviewsSchema);