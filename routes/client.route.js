import {Router} from 'express';
import { signup, login, logout, getProfile, updateProfile, setUpBillingInfo, updateBillingInfo, authClient, updatePassword } from '../controller/client.controller.js';
import { verifyClientToken } from "../auth/userAuth.js";
import { verifyClient } from '../middleware/verifyRole.js';
import { upload } from "../middleware/upload.js";

const router = Router();

// api/authenticate client
router.get('/authenticate', verifyClientToken, verifyClient, authClient);
// api/signup
router.post('/signup', signup);
// api/login
router.post('/login', login);
// api/logout
router.post('/logout', verifyClientToken, verifyClient, logout);
// api/profile
router.get('/profile', verifyClientToken, verifyClient, getProfile);
// api/profile
router.put('/profile', verifyClientToken, verifyClient, upload.single('profilePhoto'), updateProfile);
// api/billing-info
router.post('/billing-info', verifyClientToken, verifyClient, setUpBillingInfo);
// api/billing-info
router.put('/billing-info', verifyClientToken, verifyClient, updateBillingInfo);
// api/update-password
router.put('/update-password', verifyClientToken, verifyClient, updatePassword);

export default router;