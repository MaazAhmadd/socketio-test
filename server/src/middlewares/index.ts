import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { logger } from "../config";

// middleware to check if x-auth-token token attached and valid
export const authUser = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["x-auth-token"];
  if (!token)
    return res.status(401).json({ error: "Access denied. No token provided." });
  try {
    const decoded = jwt.verify(
      token as string,
      process.env.JWT_PRIVATE_KEY || "",
    );

    req.user = decoded as { _id: string };
    next();
  } catch (ex) {
    logger("authUser-middleware", "error in middleware: ", ex);
    res.status(400).json({ error: "Invalid token." });
  }
};
