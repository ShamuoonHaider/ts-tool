import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import ora from "ora";
import { Chalk } from "chalk";
import logger from "../utils/logger.js";
import { formatRuntimeError } from "../formatter/runtime.js";

const chalk = new Chalk({ level: 3 });
const log = logger("command:run");

const isDbError = (error: Error & Record<string, unknown>): boolean => {
  return (
    error.name === "MongoServerError" ||
    error.name === "MongoNetworkError" ||
    error.name === "ReplyError" ||
    typeof error.code === "string" ||
    typeof error.code === "number"
  );
};

export default async function run(
  file: string,
  options: { watch?: boolean } = {},
): Promise<void> {
  const spinner = ora({
    text: chalk.cyan(`Running ${file}...`),
    color: "cyan",
  }).start();

  const filePath = path.resolve(file);

  if (!fs.existsSync(filePath)) {
    spinner.fail(chalk.red(`File not found: ${file}`));
    process.exit(1);
  }

  spinner.stop();

  log.debug("Running file: %0", filePath);

  const runFile = () => {
    const child = spawn("tsx", [filePath], {
      stdio: ["inherit", "inherit", "pipe"],
      env: { ...process.env, FORCE_COLOR: "3" },
    });

    let stderrOutput = "";

    child.stderr?.on("data", (data: Buffer) => {
      stderrOutput += data.toString();
    });

    child.on("close", (code) => {
      if (code !== 0 && stderrOutput) {
        const prettyError = parseStdrrError(stderrOutput);
        if (prettyError) {
          console.log(prettyError);
        } else {
          console.error(stderrOutput);
        }
      }
    });

    child.on("error", (error) => {
      console.log(formatRuntimeError(error));
    });
  };

  if (options.watch) {
    log.highlight(`Watching ${file} for changes...`);
    const { default: chokidar } = await import("chokidar");

    runFile();

    chokidar.watch(filePath).on("change", () => {
      console.log(chalk.cyan("\n --> file changed, re-running...\n"));
      runFile();
    });
  } else {
    runFile();
  }
}

const parseStdrrError = (stderr: string): string | null => {
  try {
    const errorPatterns = [
      { pattern: /TypeError: (.+)/, name: "TypeError" },
      { pattern: /ReferenceError:(.+)/, name: "ReferenceError" },
      { pattern: /SyntaxError: (.+)/, name: "SyntaxError" },
      { pattern: /RangeError: (.+)/, name: "RangeError" },

      { pattern: /connect ECONNREFUSED (.+)/, name: "ConnectionError" },
      { pattern: /ETIMEOUT/, name: "TimeoutError" },
      { pattern: /MongoServerError: (.+)/, name: "MongoServerError" },
      { pattern: /ER_(.+?):/, name: "MySQLError" },
    ];

    for (const { pattern, name } of errorPatterns) {
      const match = stderr.match(pattern);
      if (match) {
        const error = new Error(match[1] || match[0]) as Error &
          Record<string, unknown>;
        error.name = name;

        if (name === "ConnecttionError" && match[1]) {
          const [host, port] = match[1].split(":");
          error.host = host;
          error.port = port;

          if (port === "5432") error.name = "PostgreSQLError";
          else if (port === "27017") error.name = "MongoNetworkError";
          else if (port === "3306") error.name = "MySQLError";
          else if (port === "6379") error.name = "ReplyError";
        }

        const stackMatch = stderr.match(/at .+ \((.+):(\d+):(\d+)\)/);

        if (stackMatch) {
          error.stack = `${name}: ${error.message}\n    at${stackMatch[0]}`;
        }

        return formatRuntimeError(error);
      }
    }

    return null;
  } catch {
    return null;
  }
};
