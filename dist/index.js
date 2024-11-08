"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const prisma_session_store_1 = require("@quixo3/prisma-session-store");
const passport_1 = __importDefault(require("passport"));
const serve_favicon_1 = __importDefault(require("serve-favicon"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = require("dotenv");
const passport_local_1 = require("passport-local");
const serviceClient_1 = require("./serviceClient");
const path_1 = require("path");
const homeRouter_1 = require("./routers/homeRouter");
const authRouter_1 = require("./routers/authRouter");
const fileRouter_1 = require("./routers/fileRouter");
const storageMiddleware_1 = require("./middlewares/storageMiddleware");
(0, dotenv_1.config)();
const PORT = 3000;
const app = (0, express_1.default)();
const isProduction = process.env.NODE_ENV === "prod";
const session = (0, express_session_1.default)({
    secret: process.env.SESSION_COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new prisma_session_store_1.PrismaSessionStore(serviceClient_1.dbClient.getInstance(), {
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
app.use(express_1.default.static((0, path_1.join)(process.cwd(), "public")));
app.use((0, serve_favicon_1.default)((0, path_1.join)(process.cwd(), "public", "favicon.ico")));
app.set("views", (0, path_1.join)(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(session);
app.use(passport_1.default.session());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
passport_1.default.use(new passport_local_1.Strategy({ usernameField: 'email', passwordField: 'password' }, (usermail, password, cb) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield serviceClient_1.dbClient.getInstance().user.findUnique({
            where: { email: usermail },
            select: { id: true, password: true, username: true, email: true },
        });
        if (!user) {
            return cb(null, false, { message: "User not found" });
        }
        const isPasswdMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isPasswdMatch)
            return cb(null, false, { message: "User not found" });
        return cb(null, user);
    }
    catch (error) {
        return cb(new Error("Something went wrong try after some time"));
    }
})));
passport_1.default.serializeUser((user, cb) => {
    return cb(null, user.id);
});
passport_1.default.deserializeUser((id, cb) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!id)
            return cb("Missing id, please login again");
        const user = yield serviceClient_1.dbClient.getInstance().user.findUnique({ where: { id: id } });
        return cb(null, user);
    }
    catch (err) {
        return cb(new Error("Failed to get user. Try clearning cookies"));
    }
}));
app.use("/auth", authRouter_1.authRouter);
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});
app.use("/", storageMiddleware_1.initStorage, homeRouter_1.homeRouter);
app.use("/file", storageMiddleware_1.initStorage, fileRouter_1.fileRouter);
app.use((err, req, res, next) => {
    res.status(500).render("errorPage", { errorMessage: err.message || "An unexpected error occurred" });
});
app.listen(PORT, () => {
    console.log(`Listening at http://127.0.0.1:${PORT}`);
});
