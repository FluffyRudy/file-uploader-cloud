import { Router } from "express";
import multer from "multer";
import { UploadFilePost, iterDirGet, iterDirPost, downloadFilePost } from "../controllers/fileController";


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const fileRouter = Router();

fileRouter.post("/upload",
    upload.fields([{ name: "files", maxCount: 10 }]),
    UploadFilePost
);
fileRouter.get("/folder", iterDirGet);
fileRouter.post("/folder", iterDirPost);
fileRouter.post("/download", downloadFilePost);

export { fileRouter }