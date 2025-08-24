import express, { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
const app = express();
const prisma = new PrismaClient();
app.use(express.json());

function runAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers["x-access-token"] as string;
    if (!token) {
      res.status(401).json({
        ok: false,
        message: "Unauthorized, no token provided",
      });
      return;
    }
    const decodedToken = jwt.verify(token, "hello world") as JwtPayload;

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
  } catch (error) {
    res.status(401).json({
      ok: false,
      message: "Unauthorized",
    });
  }
}

app.post("/add-fcmtoken", runAuthMiddleware, async (req, res) => {
  try {
    // @ts-ignore
    const userId = req.userId;
    const body = req.body.fcmToken;
    const updatedFarmer = await prisma.farmer.update({
      where: {
        id: userId,
      },
      data: {
        FCMToken: body,
      },
    });
    return res.status(201).json(updatedFarmer);
  } catch (error) {
    return res.status(500).json({
      error: "internal server error",
    });
  }
});

app.listen(5000, function () {
  console.log("server is live");
});
