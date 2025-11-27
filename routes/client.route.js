import {Router} from 'express';
import { signup, signin, signout, getProfile, updateProfile, setUpBillingInfo, updateBillingInfo } from '../controller/client.controller.js';
import { verifyToken, verifyRole } from '../auth/auth.js';

const router = Router();

// api/signup
router.post('/signup', signup);
// api/signin
router.post('/signin', signin);
// api/signout
router.post('/signout', verifyToken, verifyRole('client'), signout);
// api/profile
router.get('/profile', verifyToken,verifyRole('client'), getProfile);
// api/profile
router.put('/profile', verifyToken,verifyRole('client'), updateProfile);
// api/billing-info
router.post('/billing-info', verifyToken,verifyRole('client'), setUpBillingInfo);
// api/billing-info
router.put('/billing-info', verifyToken,verifyRole('client'), updateBillingInfo);

export default router;