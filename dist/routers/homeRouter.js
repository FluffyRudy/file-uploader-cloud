"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.homeRouter = void 0;
const express_1 = require("express");
const homeController_1 = require("../controllers/homeController");
const homeRouter = (0, express_1.Router)();
exports.homeRouter = homeRouter;
homeRouter.get("/", homeController_1.HomepageGet);
