import { Router } from "express";
import { UploadFilePost } from "../controllers/fileController";

const fileRouter = Router();

fileRouter.post("/upload", UploadFilePost);

export { fileRouter }