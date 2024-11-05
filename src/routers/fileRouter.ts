import { Router } from "express";
import multer from "multer";
import { UploadFilePost } from "../controllers/fileController";


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


const fileRouter = Router();

fileRouter.post("/upload", upload.fields([{ name: "files", maxCount: 10 }]), UploadFilePost);

export { fileRouter }