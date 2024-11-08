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
exports.storagClient = exports.dbClient = exports.StorageClient = exports.DBClient = void 0;
const client_1 = require("@prisma/client");
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = require("dotenv");
const fileFolderFilter_1 = require("./controllers/fileFolderFilter");
(0, dotenv_1.config)();
class DBClient {
    constructor() {
        this.dbClient = new client_1.PrismaClient();
    }
    getInstance() {
        return this.dbClient;
    }
}
exports.DBClient = DBClient;
class StorageClient {
    constructor() {
        this.bucketName = null;
        this.storageCLient = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    }
    logIn(credentials) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, error } = yield this.storageCLient.auth.signInWithPassword(credentials);
                return { data, error };
            }
            catch (error) {
                return { data: { user: null, session: null }, error: error };
            }
        });
    }
    signUp(credentials) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const StorageAuthResponse = yield this.storageCLient.auth.signUp(credentials);
                return StorageAuthResponse;
            }
            catch (error) {
                console.error(error);
                return error;
            }
        });
    }
    getInstance() {
        return this.storageCLient;
    }
    getbucket() {
        return this.storageCLient.storage.from(this.bucketName);
    }
    checkBucketExists(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data, error } = yield this.storageCLient.storage.listBuckets();
            if (error) {
                console.error(error);
                return false;
            }
            return data.some(bucket => bucket.name === name);
        });
    }
    setBucket(id) {
        this.bucketName = id;
    }
    uploadFile(cloudPath_1, blob_1) {
        return __awaiter(this, arguments, void 0, function* (cloudPath, blob, mimeType = 'text/plain') {
            if (!this.bucketName)
                throw new Error("Unable to find storage");
            const storage = yield this.getbucket().upload(cloudPath, blob, { contentType: mimeType, upsert: true });
            if (storage.error) {
                throw new Error(`Unable to upload file, ${storage.error.message}`);
            }
            return cloudPath.split("/").reverse()[0];
        });
    }
    createBucket(bucketName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.storageCLient.storage.createBucket(bucketName);
                return { data: response.data, error: response.error };
            }
            catch (err) {
                return { data: null, error: err };
            }
        });
    }
    getBucketName() {
        return this.bucketName;
    }
    getFolderData(folder, user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bucket = user.storage;
                const fetchedFiles = yield storagClient
                    .getInstance()
                    .storage.from(bucket)
                    .list(folder);
                if (fetchedFiles.data)
                    return (0, fileFolderFilter_1.filterFilesAndFolders)(fetchedFiles.data);
                return null;
            }
            catch (error) {
                return null;
            }
        });
    }
}
exports.StorageClient = StorageClient;
const dbClient = new DBClient();
exports.dbClient = dbClient;
const storagClient = new StorageClient();
exports.storagClient = storagClient;
