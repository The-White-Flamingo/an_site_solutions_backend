import { verifyToken } from "./auth.js";
import { Router } from "express";
import User from "../models/User.js";

const router = Router();

router.get("/me", verifyToken, async (req, res) => {
  try{
    const user = await User.findById(req.user.id).select("-password");
    res.json({user});
  
  }catch(e){
    return res.status(401).json({message: "Unauthorized" });
  } 
   
});

export default router;
  