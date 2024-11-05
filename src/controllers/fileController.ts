import { Request, Response, NextFunction } from "express";
import { join } from "path";
import { storagClient } from "../serviceClient";

export const UploadFilePost = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.files) {
        res.json({ error: "Please select at least one file" });
        return;
    }

    let files = Array.isArray(req.files)
        ? req.files
        : Object.keys(req.files).length > 0
            ? req.files.files
            : [];


    if (files.length === 0) {
        res.json({ error: "Please select at least one file" });
        return;
    }

    const uploadPromise = files.map((file) => {
        const filepath = join(
            req.body.folder || "default_folder",
            file.originalname
        );
        return storagClient.uploadFile(filepath, file.buffer);
    });
    try {
        const uploadResponse = await Promise.allSettled(uploadPromise);
        console.log(uploadResponse);
        res.json({ data: uploadResponse });
        return;
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};
