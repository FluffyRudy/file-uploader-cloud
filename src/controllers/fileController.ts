import { Request, Response, NextFunction } from "express";
import { storagClient } from "../serviceClient";
import { join } from "path"

export const UploadFilePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.isAuthenticated()) {
        return res.redirect("/");
    }
    let filenames = req.headers['x-file-name'];

    if (!filenames) {
        res.status(400).json({ message: "Filename is required", status: 400 });
        return;
    }
    if (!Array.isArray(filenames)) filenames = [filenames];

    const uploadPromises: Array<Promise<boolean>> = [];
    req.on('data', (chunk) => {
        filenames.forEach(filename => {
            const uploadPromise = storagClient.uploadFile(filename, chunk);
            uploadPromises.push(uploadPromise);
        })
    });

    req.on('end', async () => {
        try {
            const uploadResponse = await Promise.all(uploadPromises);
            res.status(200).json({ message: "Successfully uploaded file", status: 200 })
        } catch (error) {
            res.status(500).json({ message: "Internal server error", status: 500 })
        }
    });

    req.on('error', (error) => {
        console.error("upload error: ", error.message);
        res.status(503).json({ message: "Failed to upload file", status: 503 })
    })
}