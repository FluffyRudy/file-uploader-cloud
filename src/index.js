"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var express_session_1 = require("express-session");
var prisma_session_store_1 = require("@quixo3/prisma-session-store");
var passport_1 = require("passport");
var dotenv_1 = require("dotenv");
var dbClient_1 = require("./dbClient");
(0, dotenv_1.config)();
var PORT = 3000;
var app = (0, express_1.default)();
var isProduction = process.env.NODE_ENV === "prod";
var session = (0, express_session_1.default)({
    secret: process.env.SESSION_COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new prisma_session_store_1.PrismaSessionStore(dbClient_1.default.getClient(), {
        checkPeriod: 2 * 60 * 1000,
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined
    }),
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        secure: isProduction,
        httpOnly: isProduction
    }
});
app.use(session);
app.use(passport_1.default.session());
app.listen(PORT, function () {
    console.log("Listening at port http://127.0.0.1:".concat(PORT));
});
