import { errorHandler } from "../config/errorHandler.js";

export const verifyClient = (req, res, next) => {
  if (req.user.role !== "client") {
    return next(errorHandler(403, "Only clients are allowed to perform this action"));
  }
  next();
};

export const verifySurveyor = (req, res, next) => {
  if (req.user.role !== "surveyor") {
    return next(errorHandler(403, "Only surveyors are allowed to perform this action"));
  }
  next();
};

export const verifyAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(errorHandler(403, "Only admins can perform this action"));
  }
  next();
};
