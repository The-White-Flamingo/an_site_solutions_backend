import {Schema,model} from "mongoose";

const CommentSchema = new Schema({
    content:{
        type: String
    },
    user: {
        type: Schema.Types.ObjectId, ref:"User"
    },
    dispute:{
        type: Schema.Types.ObjectId, ref:"Dispute",
        required: false
    }
},{timestamps: true})

const Comment = model('Comment',CommentSchema)
export default Comment