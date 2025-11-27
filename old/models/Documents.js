import mongoose, {Schema} from 'mongoose';

const documentSchema = new Schema({
    surveyProject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Survey',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
});

const Document = mongoose.model('Document', documentSchema);

export default Document;
