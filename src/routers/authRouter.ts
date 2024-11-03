import { Router } from "express";
import { LogOutGet, SignInGet, SignInPost, SignUpGet, SignUpPost } from "../controllers/authController";
import { SignInValidator, SignUpPostValidator } from "../validator/authValidator";

const authRouter = Router();

authRouter.get("/signup", SignUpGet);
authRouter.post("/signup", SignUpPostValidator, SignUpPost);
authRouter.get("/signin", SignInGet);
authRouter.post("/signin", SignInValidator, SignInPost);
authRouter.get("/logout", LogOutGet);

export { authRouter }