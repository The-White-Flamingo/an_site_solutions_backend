import mongoose, {Schema, model} from 'mongoose';

const SurveyorSchema = new Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId, ref:'User'
    },
    tagline: {
        type: String,
        required: false
    },
    responseTime:{
        type: String,
        required:false,
        default: "1hr"
    },
    country:{
        type: String,
        required: false
    },
    about: {
        type: String,
        required: false
    },
    surveyorType: {
        type: String,
        enum: ['Boundary Surveyor','Land Surveyor'],
        default: 'Boundary Surveyor',
        required: false
    },
    languages: [
        {
            language:{type:String}
        }
    ],
    yearsOfExperience:{
        type: Number,
        required: false
    },
    projectDetails:{
        type: String
    },
    fileFormat:[
        {
            fileType:{type:String,required:false}
        }
    ],
    softwares:[
        {
            name:{type:String,required:false}
        }
    ],
    education: [{
        title:{type:String},
        institutionName:{type:String},
        dateFrom:{type:Date},
        dateTo:{type:Date},
        description:{type:String}
    }],
    professionalCertifications:[
        {
            certificateName:{type:String}
        }
    ],
    IDphoto:{
        type:String
    },
    proofOfCertificate:{
        type:String
    },
    acceptedSurveys:[
        {
            type: mongoose.Schema.Types.ObjectId, ref:'Survey'
        }
    ],
    reviews:[{
        type: mongoose.Schema.Types.ObjectId, ref:'Review'
    }],
    approved: {
        type: Boolean,
        default: false
    }
});

// Add this inside SurveyorSchema:

SurveyorSchema.methods.isProfileComplete = function () {
  const requiredFields = [
    "tagline",
    "country",
    "about",
    "surveyorType",
    "languages",
    "yearsOfExperience",
    "education",
    "professionalCertifications",
    "IDphoto",
    "proofOfCertificate"
  ];

  return requiredFields.every((field) => {
    const val = this[field];
    return val && (Array.isArray(val) ? val.length > 0 : true);
  });
};

const Surveyor = model("Surveyor",SurveyorSchema);
export default Surveyor;