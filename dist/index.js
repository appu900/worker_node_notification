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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
app.use(express_1.default.json());
function runAuthMiddleware(req, res, next) {
    try {
        const token = req.headers["x-access-token"];
        if (!token) {
            res.status(401).json({
                ok: false,
                message: "Unauthorized, no token provided",
            });
            return;
        }
        const decodedToken = jsonwebtoken_1.default.verify(token, "hello world");
        if (!decodedToken || !decodedToken.userId) {
            res.status(401).json({
                ok: false,
                message: "Invalid token",
            });
            return;
        }
        // @ts-ignore
        req.userId = decodedToken.userId;
        next();
    }
    catch (error) {
        res.status(401).json({
            ok: false,
            message: "Unauthorized",
        });
    }
}
app.post("/add-fcmtoken", runAuthMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const userId = req.userId;
        const body = req.body.fcmToken;
        const updatedFarmer = yield prisma.farmer.update({
            where: {
                id: userId,
            },
            data: {
                FCMToken: body,
            },
        });
        return res.status(201).json(updatedFarmer);
    }
    catch (error) {
        return res.status(500).json({
            error: "internal server error",
        });
    }
}));
app.listen(5000, function () {
    console.log("server is live");
});
