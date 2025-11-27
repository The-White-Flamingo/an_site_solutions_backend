import { Router } from "express";
import { createSurvey, getSurveyById, getSurveysByClient, getAllSurveys } from "../controllers/surveyController.js";
import verifyToken from "../../auth/verifyToken.js";

const router = Router();
router.use(verifyToken);

router.post("/client/:userId/surveys", createSurvey);
router.get("/client/:userId/surveys", getSurveysByClient);
router.get("/surveys", getAllSurveys);
router.get("/surveys/:surveyId", getSurveyById);
// router.post("/surveys/:surveyId/dispute", raiseDispute);

export default router;