import { NextFunction, Request, Response } from "express";

export const HomepageGet = async (req: Request, res: Response, next: NextFunction) => {
    res.render("home", { user: req.user, errors: {} })
}