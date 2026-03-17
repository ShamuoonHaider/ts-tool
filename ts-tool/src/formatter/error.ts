import chalk from "chalk";
import fs from "node:fs";
import ts from "typescript";

const formatPointer = (column: number, length: number): string => {
  return " ".repeat(column) + chalk.red("^".repeat(length));
};

const getSourceLine = (filePath: string, line: number): string => {
  try {
    const lines = fs.readFileSync(filePath, "utf-8").split("\n");
    return lines[line - 1] || "";
  } catch {
    return "";
  }
};

const extractMessage = (
  messageText: string | ts.DiagnosticMessageChain,
): string => {
  if (typeof messageText === "string") return messageText;

  let message = messageText.messageText;
  let next = messageText.next?.[0];
  while (next) {
    message += `\n       ${chalk.dim("└─")} ${next.messageText}`;
    next = next.next?.[0];
  }
  return message;
};

export const formatDiagnostic = (diagnostic: ts.Diagnostic): string => {
  const lines: string[] = [];

  if (!diagnostic.file || diagnostic.start === undefined) {
    return (
      chalk.red(`error`) +
      chalk.white(`Ts${diagnostic.code}]`) +
      chalk.white(`: ${extractMessage(diagnostic.messageText)} \n`)
    );
  }

  const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
    diagnostic.start,
  );

  const filePath = diagnostic.file.fileName;
  const lineNum = line + 1;
  const colNum = character + 1;
  const message = extractMessage(diagnostic.messageText);
  const sourceLine = getSourceLine(filePath, lineNum);
  const pointer = formatPointer(character, diagnostic.length || 1);
  const lineNumStr = String(lineNum);
  const padding = " ".repeat(lineNumStr.length);

  lines.push(chalk.red(`error`) + chalk.white(`[Ts${diagnostic.code}]`)) +
    chalk.whiteBright(message);

  lines.push(
    chalk.cyan(` --> `) + chalk.white(`${filePath}:${lineNum}:${colNum}`),
  );

  lines.push(chalk.cyan(`{padding} |`));

  lines.push(chalk.cyan(`{${lineNumStr} |`) + chalk.white(` ${sourceLine}`));

  lines.push(chalk.cyan(`${padding} |`) + chalk.red(` ${pointer}`));
  lines.push("");

  return lines.join("\n");
};

export const formatDiagnostics = (
  diagnostics: readonly ts.Diagnostic[],
): string => {
  const output = diagnostics.map(formatDiagnostic).join("\n");
  const errorCount = diagnostics.length;

  const summary =
    errorCount === 0
      ? chalk.green("\n No errors found!")
      : chalk.red(` Found ${errorCount} error${errorCount > 1 ? "s" : ""}`);

  return `${output}\n${summary}`;
};
