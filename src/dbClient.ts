import { PrismaClient } from "@prisma/client";

class DBClient {
    private pool: PrismaClient

    constructor() {
        this.pool = new PrismaClient()
    }
}