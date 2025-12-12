import express from "express";
// import {verifyToken} from "../auth/auth.js";
// import { verifyAdmin } from "../middleware/verifyRole.js";
import {
  approveSurveyor,
  approveSurvey,
  assignSurvey,
  getAllSurveys,
  getAllSurveyors,
  viewDisputes
} from "../controller/admin.controller.js";

const router = express.Router();

// router.use(verifyToken, verifyAdmin); // ✅ all admin routes protected

// router.put("/surveyor/:surveyorId/approve", approveSurveyor);
// router.put("/survey/:surveyId/approve", approveSurvey);
// router.put("/survey/:surveyId/assign/:surveyorId", assignSurvey);

// router.get("/surveyors", getAllSurveyors);
// router.get("/surveys", getAllSurveys);
// router.get("/disputes", viewDisputes);

export default router;
