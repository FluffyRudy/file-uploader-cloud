import express from "express";
import expressSession from "express-session";
import { PrismaSessionStore } from "@quixo3/prisma-session-store"
import passport from "passport";
import { config } from "dotenv";
import dbClient from "./dbClient"

config()
console.clear()

const PORT = 3000

const app = express();
const isProduction = process.env.NODE_ENV === "prod";
const session = expressSession({
    secret: process.env.SESSION_COOKIE_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(
        dbClient.getClient(), {
        checkPeriod: 2 * 60 * 1000,
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined
    }
    ),
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        secure: isProduction,
        httpOnly: isProduction
    }
})
app.use(session)
app.use(passport.session())

app.listen(PORT, () => {
    console.log(`Listening at port http://127.0.0.1:${PORT}`);
})