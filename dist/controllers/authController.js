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
exports.SignInPost = exports.SignUpPost = exports.LogOutGet = exports.SignInGet = exports.SignUpGet = void 0;
const express_validator_1 = require("express-validator");
const serviceClient_1 = require("../serviceClient");
const errorFormatter_1 = require("../utils/errorFormatter");
const passport_1 = __importDefault(require("passport"));
const bcryptjs_1 = require("bcryptjs");
const SignUpGet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render("signup", { errors: {} });
});
exports.SignUpGet = SignUpGet;
const SignInGet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render("signin", { errors: {} });
});
exports.SignInGet = SignInGet;
const LogOutGet = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    req.logOut((err) => {
        if (err)
            return next(err);
        res.redirect("/");
    });
});
exports.LogOutGet = LogOutGet;
const SignUpPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const validation = (0, express_validator_1.validationResult)(req);
    if (!validation.isEmpty()) {
        res.render("signup", { errors: (0, errorFormatter_1.formatValidationErrors)(validation.array()) });
        return;
    }
    try {
        const body = req.body;
        const salt = yield (0, bcryptjs_1.genSalt)();
        const hashedPassword = yield (0, bcryptjs_1.hash)(body.password, salt);
        const response = yield serviceClient_1.storagClient.signUp({
            email: body.email,
            password: hashedPassword,
        });
        if ("error" in response && response.error) {
            return next(response.error);
        }
        const user = yield serviceClient_1.dbClient.getInstance().user.create({
            data: {
                username: body.username,
                password: hashedPassword,
                email: body.email
            }
        });
        console.log(response);
        res.redirect("/");
    }
    catch (err) {
        if (err.code === 'P2002') {
            return next(new Error("User with this email already exist"));
        }
        return next(new Error("Unknown error occured"));
    }
});
exports.SignUpPost = SignUpPost;
const SignInPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const validator = (0, express_validator_1.validationResult)(req);
    if (!validator.isEmpty()) {
        res.render("signin", { errors: (0, errorFormatter_1.formatValidationErrors)(validator.array()) });
        return;
    }
    try {
        passport_1.default.authenticate('local', (err, user, info) => {
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
            });
        })(req, res, next);
    }
    catch (err) {
        return next(err);
    }
});
exports.SignInPost = SignInPost;
