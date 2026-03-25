import ts from "typescript";
import path from "path";
import fs from "fs";
import ora from "ora";
import chalk from "chalk";
import { formatDiagnostics } from "../formatter/error.js";
import logger from "../utils/logger.js";

const log = logger("commands:check");

const findTsConfig = (cwd: string): string | undefined => {
  const tsConfigPath = ts.findConfigFile(
    cwd,
    ts.sys.fileExists,
    "tsconfig.json",
  );
  if (!tsConfigPath) {
    log.warning("Could not find tsconfig.json, using defaults");
  }
  return tsConfigPath;
};

const getProgram = (
  filePath?: string,
  cwd: string = process.cwd(),
): ts.Program => {
  const tsConfigPath = findTsConfig(cwd);

  if (tsConfigPath) {
    const configFile = ts.readConfigFile(tsConfigPath, ts.sys.readFile);
    const parsedConfig = ts.parseJsonConfigFileContent(
      configFile.config,
      ts.sys,
      path.dirname(tsConfigPath),
    );

    const rootNames = filePath
      ? [path.resolve(filePath)]
      : parsedConfig.fileNames;

    return ts.createProgram(rootNames, parsedConfig.options);
  }

  // fallback if no tsconfig found
  return ts.createProgram(filePath ? [path.resolve(filePath)] : [], {
    strict: true,
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.NodeNext,
  });
};

export default async function check(
  file?: string,
  options: { all?: boolean; watch?: boolean } = {},
): Promise<void> {
  const spinner = ora({
    text: chalk.cyan("Type checking..."),
    color: "cyan",
  }).start();

  try {
    const cwd = process.cwd();

    if (file && !fs.existsSync(path.resolve(file))) {
      spinner.fail(chalk.red(`File not found: ${file}`));
      process.exit(1);
    }

    const program = getProgram(file, cwd);
    const diagnostics = ts.getPreEmitDiagnostics(program);
    const allDiagnostics = [...diagnostics];

    spinner.stop();

    if (allDiagnostics.length === 0) {
      log.success("No errors found!");
      return;
    }

    console.log(formatDiagnostics(allDiagnostics));
  } catch (e) {
    spinner.fail(chalk.red("Type checking failed"));
    log.error(e instanceof Error ? e.message : String(e));
    process.exit(1);
  }
}
