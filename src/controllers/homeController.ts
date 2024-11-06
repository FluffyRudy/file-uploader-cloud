import { Request, Response } from "express";

export const HomepageGet = (req: Request, res: Response) => {
    res.render("home", { user: req.user, errors: {} });
};

module.exports = { HomepageGet }