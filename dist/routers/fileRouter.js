"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileRouter = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const fileController_1 = require("../controllers/fileController");
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
const fileRouter = (0, express_1.Router)();
exports.fileRouter = fileRouter;
fileRouter.post("/upload", upload.fields([{ name: "files", maxCount: 10 }]), fileController_1.UploadFilePost);
fileRouter.get("/folder", fileController_1.iterDirGet);
fileRouter.post("/folder", fileController_1.iterDirPost);
fileRouter.post("/download", fileController_1.downloadFilePost);
