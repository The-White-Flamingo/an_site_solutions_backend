import {Schema, model} from 'mongoose';

const UserSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true  
    },
    email:{
        type: String,
        required: true,
        unique: true
    },phoneNumber:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    residentialAddress:{
        type: String,
        required: true
    },
    postalAddress:{
        type: String,
        required: true
    },
    profilePhoto:{
        type: String,
        required: false,
        default: ""
    },
    role:{
        type: String,
        enum: ['client', 'admin','surveyor'],
        default: 'client'
    }
});

const User = model('User', UserSchema);
export default User;