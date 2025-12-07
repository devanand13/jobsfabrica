import { body } from "express-validator";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { logger } from "../lib/logger";

declare global {
  namespace Express {
    interface Request {
      user?: { userId: number };
    }
  }
}

export const registerValidator = [
  body("email").isEmail().withMessage("A valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("name").optional().isString().withMessage("Name must be a string"),
];

export const loginValidator = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logger.error("Missing Token!");
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined");
  }

  try {
    const payload = jwt.verify(token, jwtSecret) as { userId: number };
    req.user = payload;
    next();
  } catch (err: unknown) {
    logger.error(err);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
