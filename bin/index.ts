#!/usr/bin/env tsx

import { Command } from "commander";
import chalk from "chalk";
import logger from "../src/utils/logger.js";
import check from "../src/commands/check.js";
import run from "../src/commands/run.js";

const log = logger("cli");
const program = new Command();

program
  .name("ts-tool")
  .description(
    chalk.cyanBright("A TypeScript Cli tool with rust-like error output"),
  )
  .version("0.1.0");

program
  .command("check [file]")
  .description("Type check a TypeScript file or entire project")
  .option("-a, --all", "Check entire project")
  .option("-w, --watch", "Watch for changes")
  .action(async (file, options) => {
    log.debug("check command called with file: %O", file);
    // will be implemented in check.ts
    await check(file, options);
  });

program
  .command("run <file>")
  .description("Run a TypeScript file")
  .option("-w, --watch", "Watch for changes")
  .action(async (file, options) => {
    log.debug("run command called with file: %0", file);
    await run(file, options);
  });

program
  .command("watch <file>")
  .description("Watch and re-run a TypeScript file on changes")
  .action(async (file) => {
    log.debug("watch command called with file: %O", file);
    // will be implemented in watch.ts
    log.highlight("watch command coming soon...");
  });

program.on("command:*", () => {
  log.error(`Unknown command: ${program.args.join(" ")}`);
  console.log();
  program.help();
});

program.parse(process.argv);
