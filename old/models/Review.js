import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    rating: { type: Number, default: 0 },
    reviewText: {
        type: String,
        required: true
    }
})

export default mongoose.model('Review',reviewSchema);