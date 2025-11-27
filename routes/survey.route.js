import {Router} from 'express';
import { verifyToken, verifyRole } from '../auth/auth.js';
import {getSurveyById,getSurveys,getSurveysByClient,createSurvey,updateSurveyById} from "../controller/survey.controller.js";
import {verifyClient} from '../middleware/verifyRole.js';

const router = Router();
router.use(verifyToken,verifyClient); // protect all survey routes

// api/survey
router.post('/survey',createSurvey);
// api/:surveyId/survey
router.put('/:surveyId/survey',updateSurveyById);
// api/surveys
router.get('/surveys',getSurveysByClient);
// api/:surveyId/survey
router.get('/:surveyId/survey',getSurveyById);

export default router;