import { Router } from "express";
import { errorHandler } from "../config/errorHandler.js";
import { refreshToken } from "../auth/auth.js";

const router = Router();
router.post("/refresh-token", async (req, res, next) => {
  try {
    const refreshTokenCookie = req.cookies?.refreshToken;
    if (!refreshTokenCookie) {
      return next(errorHandler(401, "No refresh token provided"));
    }
    const newToken = refreshToken(refreshTokenCookie);
    if (!newToken) {
      return next(errorHandler(401, "Failed to refresh token"));
    }
    res.cookie("token", newToken, {
      httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    res.json({ message: "Token refreshed successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;