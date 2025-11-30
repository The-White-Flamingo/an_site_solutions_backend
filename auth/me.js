import { verifyToken } from "./auth.js";
import { Router } from "express";
import User from "../models/User.js";

const router = Router();

router.get("/me", verifyToken, async (req, res) => {
    const user = await User.findById(req.user.id);
  
    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        pofilePhoto: user.profilePhoto,
        email: user.email,
        role: user.role
      }
    });
  });

export default router;
  