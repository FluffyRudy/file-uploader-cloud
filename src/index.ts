import express, { NextFunction, Request, Response } from "express";
import expressSession from "express-session";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import passport, { DoneCallback, use } from "passport";
import favicon from "serve-favicon";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { Strategy } from "passport-local";
import { dbClient, storagClient } from "./serviceClient";
import { User } from "./types/global";
import { join } from "path"
import { homeRouter } from "./routers/homeRouter";
import { authRouter } from "./routers/authRouter";

config();

const PORT = 3000;

const app = express();
const isProduction = process.env.NODE_ENV === "prod";
const session = expressSession({
  secret: process.env.SESSION_COOKIE_SECRET!,
  resave: false,
  saveUninitialized: false,
  store: new PrismaSessionStore(dbClient.getInstance(), {
    checkPeriod: 2 * 60 * 1000,
    dbRecordIdIsSessionId: true,
    dbRecordIdFunction: undefined,
  }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    secure: isProduction,
    httpOnly: isProduction,
  },
});

app.use(express.static(join(process.cwd(), "public")));
app.use(favicon(join(process.cwd(), "public", "favicon.ico")));
app.set("views", join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session);
app.use(passport.session());
passport.use(
  new Strategy(
    { usernameField: 'email', passwordField: 'password' },
    async (usermail, password, cb) => {
      try {
        const user: User | null = await dbClient.getInstance().user.findUnique({
          where: { email: usermail },
          select: { id: true, password: true, username: true, email: true },
        });
        if (!user) {
          return cb(null, false, { message: "User not found" });
        }
        const isPasswdMatch = await bcrypt.compare(password, user.password)
        if (!isPasswdMatch)
          return cb(null, false, { message: "User not found" })
        return cb(null, user)
      } catch (error) {
        return cb(new Error("Something went wrong try after some time"));
      }
    }
  )
);

passport.serializeUser((user, cb) => {
  return cb(null, (user as User).id)
})

passport.deserializeUser(async (id, cb) => {
  try {
    if (!id)
      return cb("Missing id, please login again")
    const user = await dbClient.getInstance().user.findUnique({ where: { id: (id as string) } })
    return cb(null, user)
  } catch (err) {
    return cb(new Error("Failed to get user. Try clearning cookies"))
  }
})

app.use("/auth", authRouter);
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
})
app.use("/", homeRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.send(`<h1>${err}</h1>`)
})

app.listen(PORT, () => {
  console.log(`Listening at port http://127.0.0.1:${PORT}`);
});
