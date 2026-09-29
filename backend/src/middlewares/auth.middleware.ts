import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";

export const requireAuth = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { isAuthenticated, userId } = getAuth(req);

    if (!isAuthenticated || !userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized at Middleware",
        });
    }

    req.userId = userId; 
    next();
};