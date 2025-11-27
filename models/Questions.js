import mongoose, {Schema,model} from 'mongoose';

const QuestionSchema = new Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
    },
    phoneNumber:{
        type: String,
        required: true,
    },
    options: {
        type: String,
        enum: ['option1', 'option2', 'option3'],
        required: true,
    },
    message:{
        type: String,
        required: false,
    }
});