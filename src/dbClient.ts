import { PrismaClient } from "@prisma/client";

class DBClient {
    private client: PrismaClient

    constructor() {
        this.client = new PrismaClient()
    }

    public getClient() {
        return this.client
    }
}

export default new DBClient();
