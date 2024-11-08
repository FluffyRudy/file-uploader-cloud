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
exports.initStorage = void 0;
const crypto_1 = require("crypto");
const serviceClient_1 = require("../serviceClient");
const initStorage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!req.isAuthenticated())
        return res.render("signin");
    const storageInstance = serviceClient_1.storagClient.getInstance();
    const storageSession = yield storageInstance.auth.getSession();
    const { id, email, password, storage, username } = req.user;
    try {
        if (storageSession.error || !storageSession.data.session || !storage) {
            const authResponse = yield serviceClient_1.storagClient.logIn({ email, password });
            const { data, error } = authResponse;
            if (error)
                return next(error);
            if (!data.user)
                return next(new Error("Unable to find user or failed to authorize user"));
            if (!data.session)
                return next(new Error("Unable to create session"));
            const compositString = email + username;
            const bucketName = (0, crypto_1.createHash)("sha256").update(compositString).digest("hex");
            const bucketExists = yield serviceClient_1.storagClient.checkBucketExists(bucketName);
            if (bucketExists) {
                serviceClient_1.storagClient.setBucket(bucketName);
                return next();
            }
            const bucket = yield serviceClient_1.storagClient.createBucket(bucketName);
            if (bucket.error)
                return next(bucket.error);
            if (!((_a = bucket.data) === null || _a === void 0 ? void 0 : _a.name))
                return next(new Error("Somethnig went wrong, unalbe to get storage"));
            yield serviceClient_1.dbClient.getInstance().user.update({
                where: { id: id },
                data: { storage: bucketName }
            });
            serviceClient_1.storagClient.setBucket(bucket.data.name);
            next();
        }
        else {
            serviceClient_1.storagClient.setBucket(storage);
            next();
        }
    }
    catch (error) {
        return next(error);
    }
});
exports.initStorage = initStorage;
