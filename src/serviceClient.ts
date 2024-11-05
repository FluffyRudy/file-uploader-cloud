import { PrismaClient } from "@prisma/client";
import { AuthApiError, AuthResponse, createClient, SupabaseClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { StorageAuthCredentials, StorageAuthResponse } from "./types/global";

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

    public async logIn(credentials: StorageAuthCredentials): StorageAuthResponse {
        try {
            const StorageAuthResponse = await this.storageCLient.auth.signInWithPassword(
                credentials
            );
            return StorageAuthResponse;
        } catch (error) {
            console.error(error);
            return error as StorageAuthResponse;
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


    public async createBucket(id: string) {
        const response = await this.storageCLient.storage.createBucket(id);
        if (response.error) {
            return null
        }
        return response
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
        console.log(cloudPath, this.bucketName)
        if (!this.bucketName)
            throw new Error("Unable to find storage");
        console.log(mimeType)
        const storage = await this.getbucket().upload(cloudPath, blob, { contentType: mimeType, upsert: true });
        if (storage.error) {
            throw new Error(`Unable to upload file, ${storage.error.message}`)
        }
        return cloudPath.split("/").reverse()[0];
    }
}

const dbClient = new DBClient();
const storagClient = new StorageClient();

export { dbClient, storagClient };
