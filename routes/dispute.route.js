import {Router} from 'express';
import {raiseDispute,commentDispute,cancelDispute,clientDisputes,disputeByClient} from "../controller/dispute.controller.js";
import { verifyClientToken } from '../auth/userAuth.js';
import { verifyClient } from '../middleware/verifyRole.js';

const router = Router();

// api/client/:surveyId/dispute
router.post('/:surveyId/dispute',verifyClientToken,verifyClient,raiseDispute);
// api/client/:disputeId/cancel
router.put('/:disputeId/cancel',verifyClientToken,verifyClient,cancelDispute);
// api/client/:disputeId/comment
router.post('/:disputeId/comment',verifyClientToken,verifyClient,commentDispute);
// api/client/disputes
router.get('/disputes',verifyClientToken,verifyClient,clientDisputes); 
// api/client/:disputeId/dispute
router.get('/:disputeId/dispute',verifyClientToken,verifyClient,disputeByClient);

export default router;