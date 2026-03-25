import path from "path";
import fs from "node:fs";
import { Chalk } from "chalk";
import chokidar from "chokidar";
import logger from "../utils/logger.js";
import check from "./check.js";

const chalk = new Chalk({ level: 3 });
const log = logger("commands:watch");

export default async function watch(file: string): Promise<void> {
  const filePath = path.resolve(file);

  if (!fs.existsSync(filePath)) {
    log.error(`File not found: ${file}`);
    process.exit(1);
  }

  console.log(
    chalk.cyan(`\n  Watching`) +
      chalk.blueBright(` ${file} `) +
      chalk.cyan(`for changes...\n`),
  );

  await check(file);

  const watcher = chokidar.watch(filePath, {
    persistent: true,
    ignoreInitial: true,
  });

  watcher.on("change", async () => {
    console.clear();
    console.log(
      chalk.cyan(`  --> `) +
        chalk.blueBright(`File changed`) +
        chalk.cyan(` re-checking...\n`),
    );
    await check(file);
  });

  watcher.on("error", (error) => {
    log.error(`Watcher error: ${error}`);
  });

  process.on("SIGINT", () => {
    console.log(chalk.yellow("\n\n  Stopping watcher...\n"));
    watcher.close();
    process.exit(0);
  });
}
