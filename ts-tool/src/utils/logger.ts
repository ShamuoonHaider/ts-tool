import chalk from "chalk";
import debug from "debug";

type LogLevel = "log" | "warning" | "error" | "highlight" | "success" | "debug";

interface Logger {
  log: (...args: unknown[]) => void;
  warning: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  highlight: (...args: unknown[]) => void;
  success: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
}

const formatArgs = (args: unknown[]): string[] => {
  return args.map((a) =>
    typeof a === "object" ? JSON.stringify(a, null, 2) : String(a),
  );
};

const logger = (name: string = "ts-tool"): Logger => {
  const prefix = chalk.bold(`[${name}]`);
  const dbg = debug(`ts-tool:${name}`);

  return {
    log: (...args) => console.log(chalk.gray(prefix, ...formatArgs(args))),
    warning: (...args) =>
      console.warn(chalk.yellow(prefix, ...formatArgs(args))),
    error: (...args) => console.error(chalk.red(prefix, ...formatArgs(args))),
    highlight: (...args) =>
      console.log(chalk.bgCyanBright(prefix, ...formatArgs(args))),
    success: (...args) => console.log(chalk.green(prefix, ...formatArgs(args))),
    debug: (...args) => dbg(formatArgs(args).join(" ")),
  };
};

export default logger;
