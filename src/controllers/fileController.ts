import { Request, Response, NextFunction } from "express";
import { join } from "path";
import { dbClient, storagClient } from "../serviceClient";
import { User } from "../types/global";

export const UploadFilePost = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.isAuthenticated()) {
        res.status(403).json({ error: "Unauthorized access", status: 403 });
        return;
    }
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
        const folder = (req.body.folder ? ' ,' + req.body.folder : '')
        await dbClient.getInstance().uploadLogs.create({
            data: {
                user_id: (req.user as User).id,
                file_path: files.reduce((accm, curr) => curr.filename + accm, ',') + folder,
                file_size: files.reduce((accm, file) => file.size + accm, 0),
                status: 'failure',
                error_message: (error as Error).message
            }
        })
    }
};

// const { data, error } = await storagClient.getInstance()
// .storage
// .from(user.storage!)
// .list('', { limit: 100 });