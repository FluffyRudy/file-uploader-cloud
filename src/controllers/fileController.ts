import { Request, Response, NextFunction } from "express";
import { join } from "path";
import { storagClient } from "../serviceClient";

export const UploadFilePost = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.files) {
        res.status(400).json({ error: "Please select at least one file", status: 400 });
        return;
    }

    let files = Array.isArray(req.files)
        ? req.files
        : Object.keys(req.files).length > 0
            ? req.files.files
            : [];


    if (files.length === 0) {
        res.status(400).json({ error: "Please select at least one file", status: 400 });
        return;
    }

    const uploadPromise = files.map((file) => {
        const filepath = join(
            req.body.folder || "default_folder",
            file.originalname
        );
        return storagClient.uploadFile(filepath, file.buffer, file.mimetype);
    });
    try {
        const uploadResponse = await Promise.allSettled(uploadPromise);
        res.status(200).json({ data: uploadResponse, status: 200 });
    } catch (error) {
        res.status(500).json({ error: "Internal server error", status: 500 });
    }
};

// const { data, error } = await storagClient.getInstance()
// .storage
// .from(user.storage!)
// .list('', { limit: 100 });