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
        const folder = req.body.folder ? " ," + req.body.folder : "";
        await dbClient.getInstance().uploadLogs.create({
            data: {
                user_id: (req.user as User).id,
                file_path:
                    files.reduce((accm, curr) => curr.filename + accm, ",") + folder,
                file_size: files.reduce((accm, file) => file.size + accm, 0),
                status: "failure",
                error_message: (error as Error).message,
            },
        });
    }
};

export const iterDirGet = async (req: Request, res: Response) => {
    res.render("listFiles", { cwd: '' });
};

export const iterDirPost = async (req: Request, res: Response) => {
    const folder = req.body.currentFolder;
    if (folder === undefined || folder === null) {
        res.status(404).json({ error: "No files and folders found", status: 400 });
        return;
    }
    try {
        const fetchedFiles = await storagClient.getFolderData(folder, (req.user as User));
        res.status(200).json({ fileObjects: fetchedFiles, currentFolder: folder, errors: {} })
    } catch (err) {
        console.log(err)
        res.status(404).json({ error: "No files and folders found", fileObjects: null, currentFolder: folder });
    }
}

export const downloadFilePost = async (req: Request, res: Response) => {
    const user = req.user! as User;
    const filename: string | undefined = req.body.filename

    if (!user.storage || !filename)
        return res.render("listFiles", { cwd: '' })

    try {
        const downloadResponse = await storagClient.getInstance()
            .storage.from(user.storage).download(filename);
        if (!downloadResponse.data) {
            res.status(500).json({ error: 'something went wrong' });
            return;
        }
        const actualFilename = filename.split('/').pop();
        res.setHeader('Content-Type', downloadResponse.data.type)
        res.setHeader('Content-Length', downloadResponse.data.size);
        res.setHeader('Content-Disposition', `attachment; filename="${actualFilename}"`);
        const buffer = await downloadResponse.data.arrayBuffer();
        res.send(Buffer.from(buffer));
    } catch (err) {
        res.status(500).json({ error: 'something went wrong' })
    }
}