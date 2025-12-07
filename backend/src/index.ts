import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { logger } from "./lib/logger";
import { connectMongo } from "./lib/mongo";

import resumeRouter from "./routes/resume";
import authRouter from "./routes/auth";
import userRouter from "./routes/user";
import pinoHttp from "pino-http";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  pinoHttp({
    logger,
    customSuccessMessage: (req, res) => {
      return `${req.method} ${req.url} → ${res.statusCode}`;
    },
    customErrorMessage: (req, res, err) => {
      return `Error on ${req.method} ${req.url}: ${err.message}`;
    },
    serializers: {
      req(req) {
        return { method: req.method, url: req.url };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.use("/api/resume", resumeRouter);
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectMongo();

  app.listen(PORT, async () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

startServer();
