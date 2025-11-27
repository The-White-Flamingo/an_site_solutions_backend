import { Router } from "express";
import verifyToken from "../middleware/verifyToken.js";
import { verifyRole } from "../middleware/verifyRole.js";
import {
    approveSurvey,
    approveSurveyor,
    resolveDispute,
    getAllClient,
    getAllSurveyors,
    getAllSurveys,
    deactivateUser
} from "../controllers/adminController.js";

const router = Router();

router.use(verifyToken,verifyRole("admin"));

router.patch("/surverys/:surveyId/approve",approveSurvey);
router.patch("/surveys/:surveyId/dispute/resolve",resolveDispute);
router.get("/surveys",getAllSurveys);

router.patch("/surveyors/approve",approveSurveyor);

router.get("/users",getAllClient);
router.get("/surveyors",getAllSurveyors);
router.patch("/users/:userId/deactivate",deactivateUser);

export default router