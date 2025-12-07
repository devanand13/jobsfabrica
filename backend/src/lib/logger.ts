import pino from "pino";
import "dotenv/config";

const isDev = process.env.NODE_ENV !== "production";

export const logger = pino({
  level: "info",
  transport: isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "yyyy-mm-dd HH:MM:ss",
          ignore: "pid,hostname",
        },
      }
    : undefined,
});
