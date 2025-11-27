import mongoose, {Schema, model} from "mongoose";

const ReviewSchema = new Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    surveyor:{type:mongoose.Schema.Types.ObjectId, ref:'Surveyor'},
    rating: {
        type: Number,
        required: false,
        default: 0
    },
    remarks: {
        type: String,
        require: true
    },
    createdAt: {type: Date, default: Date.now}
});

const Review = model("Review",ReviewSchema);
export default Review;