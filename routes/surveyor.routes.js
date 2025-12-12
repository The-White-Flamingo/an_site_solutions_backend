import {Router} from 'express';
import {
    signup,login,
    identityField,updateProfile,
    setUpBillingInfo,updateBillingInfo,
    completeSurveyorProfile,updatePassword,
    getAssignedSurveys,acceptSurvey,       
    submitWork,declineSurvey,startWork,
    logout,authenticateSurveyor,getProfile,
    getDisputedSurveys,getDisputedSurvey,getSurveyById
} from "../controller/surveyor.controller.js";
import { verifySurveyor } from '../middleware/verifyRole.js';
import { verifySurveyorToken } from '../auth/suveyorAuth.js';
import { upload } from "../middleware/upload.js";

const router = Router();

router.get('/authenticate',verifySurveyorToken, verifySurveyor, authenticateSurveyor);
// api/surveyor/signup
router.post('/signup',signup);
// api/surveyor/login
router.post('/login', login);
// api/surveyor/logout
router.post('/logout', verifySurveyorToken, verifySurveyor, logout);

// api/surveyor/identity-profile
router.put('/identity-profile',verifySurveyorToken, upload.array('documents', 5), verifySurveyor,  identityField);
// api/surveyor/profile
router.put('/profile', verifySurveyorToken, verifySurveyor, upload.single('profilePhoto'), updateProfile);
// api/surveyor/billing-info
router.post('/billing-info', verifySurveyorToken, verifySurveyor, setUpBillingInfo);
// api/surveyor/billing-info
router.put('/billing-info', verifySurveyorToken, verifySurveyor, updateBillingInfo);
// api/surveyor/profile
router.get("/profile",verifySurveyorToken,verifySurveyor,getProfile);
// api/surveyor/update-password
router.put("/update-password",verifySurveyorToken,verifySurveyor,updatePassword);

// api/surveyor/complete-profile
router.post('/complete-profile', verifySurveyorToken, verifySurveyor, completeSurveyorProfile);
// api/surveyor/assigned
router.get("/assigned", verifySurveyorToken, verifySurveyor, getAssignedSurveys);
// api/surveyor/:surveyId/assigned
router.get("/:surveyId/assigned", verifySurveyorToken,verifySurveyor,getSurveyById);
// api/surveyor/:surveyId/accept
router.put("/:surveyId/accept", verifySurveyorToken, verifySurveyor, acceptSurvey);
// api/surveyor/:surveyId/decline
router.put("/:surveyId/decline", verifySurveyorToken, verifySurveyor, declineSurvey);
// api/surveyor/:surveyId/start
router.put("/:surveyId/start", verifySurveyorToken, verifySurveyor, startWork);
// api/surveyor/:surveyId/submit
router.put("/:surveyId/submit", verifySurveyorToken, verifySurveyor, upload.array('documents', 10), submitWork);

// api/surveyor/getDisputedSurvey
router.get("/disputes",verifySurveyorToken,verifySurveyor,getDisputedSurveys);
// api/surveyor/:disputeId/dispute
router.get("/:disputeId/dispute",verifySurveyorToken,verifySurveyor,getDisputedSurvey);
// get all users
// router.get('/users',getUsers);

export default router;