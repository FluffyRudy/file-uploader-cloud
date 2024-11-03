import { PrismaClient } from "@prisma/client";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { LoginCredentials, LoginResponse } from "./types/global";

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

    constructor() {
        this.storageCLient = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_KEY!
        );
    }

    public async logIn(credentials: LoginCredentials): LoginResponse {
        try {
            const loginResponse = await this.storageCLient.auth.signInWithPassword(
                credentials
            );
            return loginResponse;
        } catch (error) {
            console.error(error);
            return error as LoginResponse;
        }
    }
}

const dbClient = new DBClient();
const storagClient = new StorageClient();

export { dbClient, storagClient };
