import { config } from "@/config";
import pino, { Logger } from "pino";

export let logger: Logger;

// https://github.com/pinojs/pino/blob/master/lib/levels.js#L13-L20
const logLevelToSeverityLookup: Record<string, string> = {
  "10": "TRACE",
  "20": "DEBUG",
  "30": "INFO",
  "40": "WARNING",
  "50": "ERROR",
  "60": "CRITICAL",
};

export const initLogger = async () => {
  const nodeEnv = config.env;
  const isProduction = nodeEnv === "production";
  const targets: pino.TransportMultiOptions["targets"][number][] = [
    isProduction
      ? { level: "info", target: "pino/file", options: {} }
      : {
          level: "info",
          target: "pino-pretty", // must be installed separately
          options: {
            colorize: true,
          },
        },
  ];

  const transport = pino.transport({
    targets,
  });

  logger = pino(
    {
      mixin(_context, level) {
        return {
          severity:
            logLevelToSeverityLookup[level] || logLevelToSeverityLookup["30"],
        };
      },
      level: process.env.PINO_LOG_LEVEL || "info",
      formatters: {
        bindings: bindings => {
          return {
            pid: bindings.pid,
            hostname: bindings.hostname,
          };
        },
      },
    },
    transport,
  );
};
