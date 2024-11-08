import { NextFunction, Request, Response } from "express";
import { createHash } from "crypto"
import { dbClient, storagClient } from "../serviceClient";
import { User } from "../types/global";

export const initStorage = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated())
        return res.render("/auth/login");

    const storageInstance = storagClient.getInstance();
    const storageSession = await storageInstance.auth.getSession();
    const { id, email, password, storage, username } = (req.user as User)
    try {
        if (storageSession.error || !storageSession.data.session || !storage) {
            const authResponse = await storagClient.logIn({ email, password })
            const { data, error } = authResponse;
            if (error) return next(error);
            if (!data.user) return next(new Error("Unable to find user or failed to authorize user"));
            if (!data.session) return next(new Error("Unable to create session"));

            const compositString = email + username;
            const bucketName = createHash("sha256").update(compositString).digest("hex");

            const bucketExists = await storagClient.checkBucketExists(bucketName);

            if (bucketExists) {
                storagClient.setBucket(bucketName);
                return next();
            }

            const bucket = await storagClient.createBucket(bucketName);
            if (bucket.error) return next(bucket.error);
            if (!bucket.data?.name) return next(new Error("Somethnig went wrong, unalbe to get storage"));
            await dbClient.getInstance().user.update({
                where: { id: id },
                data: { storage: bucketName }
            })
            storagClient.setBucket(bucket.data.name);
            next();
        } else {
            storagClient.setBucket(storage);
            next()
        }
    } catch (error) {
        return next(error)
    }
}
