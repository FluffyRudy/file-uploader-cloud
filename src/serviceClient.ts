import { PrismaClient } from "@prisma/client";
import { AuthApiError, AuthResponse, createClient, SupabaseClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { StorageAuthCredentials, User } from "./types/global";
import { filterFilesAndFolders } from "./controllers/fileFolderFilter";

config();

export class DBClient {
    private dbClient: PrismaClient;

    constructor() {
        this.dbClient = new PrismaClient();
    }

    public getInstance() {
        return this.dbClient;
    }
}

export class StorageClient {
    private storageCLient: SupabaseClient;
    private bucketName: string | null = null;

    constructor() {
        this.storageCLient = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_KEY!
        );
    }

    public async logIn(credentials: StorageAuthCredentials) {
        try {
            const { data, error } = await this.storageCLient.auth.signInWithPassword(
                credentials
            );
            return { data, error };
        } catch (error) {
            return { data: { user: null, session: null }, error: error }
        }
    }

    public async signUp(credentials: StorageAuthCredentials): Promise<AuthResponse | AuthApiError> {
        try {
            const StorageAuthResponse = await this.storageCLient.auth.signUp(credentials);
            return StorageAuthResponse;
        } catch (error) {
            console.error(error);
            return (error as AuthApiError)
        }
    }

    public getInstance() {
        return this.storageCLient;
    }


    private getbucket() {
        return this.storageCLient.storage.from(this.bucketName!);
    }

    public async checkBucketExists(name: string): Promise<boolean> {
        const { data, error } = await this.storageCLient.storage.listBuckets();
        if (error) {
            console.error(error);
            return false;
        }
        return data.some(bucket => bucket.name === name);
    }

    public setBucket(id: string) {
        this.bucketName = id;
    }

    public async uploadFile(cloudPath: string, blob: Buffer, mimeType = 'text/plain') {
        if (!this.bucketName)
            throw new Error("Unable to find storage");
        const storage = await this.getbucket().upload(cloudPath, blob, { contentType: mimeType, upsert: true });
        if (storage.error) {
            throw new Error(`Unable to upload file, ${storage.error.message}`)
        }
        return cloudPath.split("/").reverse()[0];
    }

    public async createBucket(bucketName: string) {
        try {
            const response = await this.storageCLient.storage.createBucket(bucketName);
            return { data: response.data, error: response.error }
        } catch (err) {
            return { data: null, error: (err as Error) }
        }
    }

    public getBucketName() {
        return this.bucketName;
    }

    public async getFolderData(folder: string, user: User) {
        try {
            const bucket = user.storage;
            const fetchedFiles = await storagClient
                .getInstance()
                .storage.from(bucket!)
                .list(folder);
            if (fetchedFiles.data) return filterFilesAndFolders(fetchedFiles.data);
            return null;
        } catch (error) {
            return null;
        }
    }
}

const dbClient = new DBClient();
const storagClient = new StorageClient();

export { dbClient, storagClient };
