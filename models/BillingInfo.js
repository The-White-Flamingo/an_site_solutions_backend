import mongoose, {Schema, model} from "mongoose";

const BillingInfoSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId, ref: "User",
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    companyTitle: {
        type: String,
        required: false
    },
    city:{
        type: String,
        required: true
    },
    address:{
        type: String,
        required: true
    },
    postCode:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    phone:{
        type: String,
        required: true
    }
});

const BillingInfo = model("BillingInfo", BillingInfoSchema);
export default BillingInfo;