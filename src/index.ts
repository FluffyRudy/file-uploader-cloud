import express, { Request } from "express";
import expressSession from "express-session";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import passport, { DoneCallback, use } from "passport";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { Strategy } from "passport-local";
import { dbClient, storagClient } from "./serviceClient";
import { User } from "./types/global";

config();
console.clear(); //clear this

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
app.use(session);
app.use(passport.session());
passport.use(
  new Strategy(
    async (useremail, password, cb) => {
      try {
        const user: User | null = await dbClient.getInstance().user.findUnique({
          where: { email: useremail },
          select: { id: true, password: true, username: true, email: true },
        });
        if (!user) {
          return cb(null, false, { message: "User not found" });
        }
        const isPasswdMatch = await bcrypt.compare(password, user.password)
        if (isPasswdMatch)
          return cb(null, user);
        return cb(null, false, { message: "Usern not found" })
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

app.listen(PORT, () => {
  console.log(`Listening at port http://127.0.0.1:${PORT}`);
});
