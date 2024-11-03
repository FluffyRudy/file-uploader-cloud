import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { dbClient, storagClient } from "../serviceClient";
import { SignUpRequestBody, SignInRequestBody, User } from "../types/global"
import { formatValidationErrors } from "../utils/errorFormatter";
import passport from "passport";
import { hash, genSalt } from "bcryptjs";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";


export const SignUpGet = async (req: Request, res: Response) => {
    res.render("signup", { errors: {} })
}

export const SignInGet = async (req: Request, res: Response) => {
    res.render("signin", { errors: {} })
}

export const LogOutGet = async (req: Request, res: Response, next: NextFunction) => {
    req.logOut((err) => {
        if (err) return next(err)
        res.redirect("/");
    })
}

export const SignUpPost = async (req: Request, res: Response, next: NextFunction) => {
    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        res.render("signup", { errors: formatValidationErrors(validation.array()) });
        return;
    }

    try {
        const body = (req.body as SignUpRequestBody)
        const salt = await genSalt();
        const hashedPassword = await hash(body.password, salt);
        const user = await dbClient.getInstance().user.create({
            data: {
                username: body.username,
                password: hashedPassword,
                email: body.email
            }
        });
        res.redirect("/");
    } catch (err) {
        if ((err as PrismaClientKnownRequestError).code === 'P2002') {
            console.log(err)
            return next(new Error("User with this email already exist"));
        }
        return next(new Error("Unknown error occured"))
    }
}

export const SignInPost = async (req: Request, res: Response, next: NextFunction) => {
    const validator = validationResult(req);
    if (!validator.isEmpty()) {
        res.render("signin", { errors: formatValidationErrors(validator.array()) });
        return;
    }
    try {
        passport.authenticate('local', (err: Error, user: User, info: { message: string, status?: any }) => {
            console.log(err, user, info)
            if (err) {
                return next(err);
            }
            if (!user) {
                res.render("signin", { errors: { userNotFound: "User not found" } });
                return;
            }
            req.logIn(user, (loginError) => {
                if (loginError) {
                    return next(loginError);
                }
                res.redirect("/");
                return;
            })
        })(req, res, next);
    } catch (err) {
        return next(err)
    }
}
