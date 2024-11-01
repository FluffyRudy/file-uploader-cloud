"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var DBClient = /** @class */ (function () {
    function DBClient() {
        this.client = new client_1.PrismaClient();
    }
    DBClient.prototype.getClient = function () {
        return this.client;
    };
    return DBClient;
}());
exports.default = new DBClient();
