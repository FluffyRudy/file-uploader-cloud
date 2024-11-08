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
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadFilePost = exports.iterDirPost = exports.iterDirGet = exports.UploadFilePost = void 0;
const path_1 = require("path");
const serviceClient_1 = require("../serviceClient");
const UploadFilePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.isAuthenticated()) {
        res.status(403).json({ error: "Unauthorized access", status: 403 });
        return;
    }
    if (!req.files) {
        res
            .status(400)
            .json({ error: "Please select at least one file", status: 400 });
        return;
    }
    let files = Array.isArray(req.files)
        ? req.files
        : Object.keys(req.files).length > 0
            ? req.files.files
            : [];
    if (files.length === 0) {
        res
            .status(400)
            .json({ error: "Please select at least one file", status: 400 });
        return;
    }
    const uploadPromise = files.map((file) => {
        const filepath = (0, path_1.join)(req.body.folder || "default_folder", file.originalname);
        return serviceClient_1.storagClient.uploadFile(filepath, file.buffer, file.mimetype);
    });
    try {
        const uploadResponse = yield Promise.allSettled(uploadPromise);
        res.status(200).json({ data: uploadResponse, status: 200 });
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error", status: 500 });
        const folder = req.body.folder ? " ," + req.body.folder : "";
        yield serviceClient_1.dbClient.getInstance().uploadLogs.create({
            data: {
                user_id: req.user.id,
                file_path: files.reduce((accm, curr) => curr.filename + accm, ",") + folder,
                file_size: files.reduce((accm, file) => file.size + accm, 0),
                status: "failure",
                error_message: error.message,
            },
        });
    }
});
exports.UploadFilePost = UploadFilePost;
const iterDirGet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render("listFiles", { cwd: '' });
});
exports.iterDirGet = iterDirGet;
const iterDirPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const folder = req.body.currentFolder;
    if (folder === undefined || folder === null) {
        res.status(404).json({ error: "No files and folders found", status: 400 });
        return;
    }
    try {
        const fetchedFiles = yield serviceClient_1.storagClient.getFolderData(folder, req.user);
        res.status(200).json({ fileObjects: fetchedFiles, currentFolder: folder, errors: {} });
    }
    catch (err) {
        console.log(err);
        res.status(404).json({ error: "No files and folders found", fileObjects: null, currentFolder: folder });
    }
});
exports.iterDirPost = iterDirPost;
const downloadFilePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const filename = req.body.filename;
    if (!user.storage || !filename)
        return res.render("listFiles", { cwd: '' });
    try {
        const downloadResponse = yield serviceClient_1.storagClient.getInstance()
            .storage.from(user.storage).download(filename);
        if (!downloadResponse.data) {
            res.status(500).json({ error: 'something went wrong' });
            return;
        }
        const actualFilename = filename.split('/').pop();
        res.setHeader('Content-Type', downloadResponse.data.type);
        res.setHeader('Content-Length', downloadResponse.data.size);
        res.setHeader('Content-Disposition', `attachment; filename="${actualFilename}"`);
        const buffer = yield downloadResponse.data.arrayBuffer();
        res.send(Buffer.from(buffer));
    }
    catch (err) {
        res.status(500).json({ error: 'something went wrong' });
    }
});
exports.downloadFilePost = downloadFilePost;
