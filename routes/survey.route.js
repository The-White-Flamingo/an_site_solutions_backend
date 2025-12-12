import {Router} from 'express';
import { verifyClientToken } from '../auth/userAuth.js';
import {getSurveyById,getSurveysByClient,createSurvey,updateSurveyById,deleteSurveyById} from "../controller/survey.controller.js";
import {verifyClient} from '../middleware/verifyRole.js';

const router = Router();
router.use(verifyClientToken,verifyClient); // protect all survey routes

// api/survey
router.post('/survey',createSurvey);
// api/:surveyId/survey
router.put('/:surveyId/survey',updateSurveyById);
// api/surveys
router.get('/surveys',getSurveysByClient);
// api/:surveyId/survey
router.get('/:surveyId/survey',getSurveyById);
// api/:surveyId/survey
router.delete('/:surveyId/survey',deleteSurveyById);

export default router;