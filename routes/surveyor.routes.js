import {Router} from 'express';
import { verifyToken} from '../auth/auth.js';
import {
    signup,signin,signout,
    identityField,updateProfile,
    setUpBillingInfo,updateBillingInfo,
    getUsers,completeSurveyorProfile,
    getAssignedSurveys,acceptSurvey,       
    submitWork,declineSurvey,startWork
} from "../controller/surveyor.controller.js";
import { verifySurveyor } from '../middleware/verifyRole.js';

const router = Router();

// api/surveyor/signup
router.post('/surveyor/signup',signup);

// api/surveyor/signin
router.post('/surveyor/signin', signin);

// api/surveyor/identity-profile
router.put('/surveyor/identity-profile',verifyToken, verifySurveyor,  identityField);
// api/surveyor/profile
router.put('/surveyor/profile',verifyToken, verifySurveyor, updateProfile);
// api/surveyor/billing-info
router.post('/surveyor/billing-info',verifyToken, verifySurveyor, setUpBillingInfo);
// api/surveyor/billing-info
router.put('/surveyor/billing-info',verifyToken, verifySurveyor, updateBillingInfo);
// api/surveyor/signout
router.post('/surveyor/signout',verifyToken, verifySurveyor, signout);

// api/surveyor/complete-profile
router.post('/surveyor/complete-profile',verifyToken, verifySurveyor, completeSurveyorProfile);
// api/surveyor/assigned
router.get("/surveyor/assigned", getAssignedSurveys);
// api/surveyor/:surveyId/accept
router.put("/surveyor/:surveyId/accept", acceptSurvey);
// api/surveyor/:surveyId/decline
router.put("/surveyor/:surveyId/decline", declineSurvey);
// api/surveyor/:surveyId/start
router.put("/surveyor/:surveyId/start", startWork);
// api/surveyor/:surveyId/submit
router.put("/surveyor/:surveyId/submit", submitWork);

// get all users
router.get('/users',getUsers);

export default router;