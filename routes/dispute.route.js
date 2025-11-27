import {Router} from 'express';
import { verifyToken, verifyRole } from '../auth/auth.js';
import {raiseDispute,commentDispute,cancelDispute,disputesByClient,disputeByClient} from "../controller/dispute.controller.js";

const router = Router();
router.use(verifyToken,verifyRole('client'));

// api/:surveyId/dispute
router.post('/:surveyId/dispute',raiseDispute);
// api/dispute/cancel
router.put('/:disputeId/cancel',cancelDispute);
// api/:disputeId/comment
router.post('/:disputeId/comment',commentDispute);
// api/disputes
router.get('/disputes',disputesByClient);
// api/:disputeId/dispute
router.get('/:disputeId/dispute',disputeByClient);

export default router;