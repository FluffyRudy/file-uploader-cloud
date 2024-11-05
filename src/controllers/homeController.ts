import { NextFunction, Request, Response } from "express";
import { dbClient, storagClient } from "../serviceClient";
import { User } from "../types/global";
import { createHash } from "crypto"

export const HomepageGet = async (req: Request, res: Response, next: NextFunction) => {
    const storageNotFoundMessage = 'Sorry storage not found, please verify your email';
    if (!req.isAuthenticated()) {
        return res.render("home", { user: req.user, errors: {} });
    }

    const user = req.user as User
    if (user.storage) {
        storagClient.setBucket(user.storage)
    }
    try {
        const storageSession = await storagClient.getInstance().auth.getSession();
        if (!storageSession.data.session) {
            const { id, email, password, username } = req.user as User;
            const loginResponse = await storagClient.logIn({ email, password });
            if ('error' in loginResponse && loginResponse.error) {
                const errors = { storageNotFound: storageNotFoundMessage }
                return res.render("home", { user: req.user, errors })
            }
            const compositName = email + username;
            const bucketName = createHash("sha256").update(compositName).digest('hex');
            const bucketExists = await storagClient.checkBucketExists(bucketName);
            if (!bucketExists) {
                const errors = { storageNotFoundError: "Sorry, something went wrong when initialisizng storage" }
                const bucket = await storagClient.createBucket(bucketName);
                if (bucket && bucket.error) {
                    return res.render("home", { user: req.user, errors })
                }
                if (!bucket?.data) {
                    return res.render("home", { user: req.user, errors })
                }
                const updateResponse = await dbClient.getInstance().user.update({
                    where: { id: id },
                    data: { storage: bucket.data.name }
                });
                storagClient.setBucket(bucket.data.name);
                if (!updateResponse) {
                    return res.render("home", { user: req.user, errors })
                }
            }
        }
        return res.render("home", { user: req.user, errors: {} });
    } catch (error) {
        console.error(error);
        return res.render("home", { user: req.user, errors: { general: "An error occurred" } });
    }
}
