import { Chalk } from "chalk";
import ts from "typescript";

const chalk = new Chalk({ level: 3 });

const PG_ERROR_CODES: Record<string, string> = {
  "23505": "PG:DUPLICATE",
  "23503": "PG:FOREIGN_KEY",
  "23502": "PG:NOT_NULL",
  "42P01": "PG:UNDEFINED_TABLE",
  "42703": "PG:UNDEFINED_COLUMN",
  "28P01": "PG:AUTH_FAILED",
  "3D000": "PG:DB_NOT_FOUND",
  ECONNREFUSED: "PG:CONNECTION_REFUSED",
  ETIMEDOUT: "PG:TIMEOUT",
};

const MONGO_ERROR_CODES: Record<number, string> = {
  11000: "MONGO: DUPLICATE_KEY",
  13: "MONGO:UNAUTHORIZED",
  18: "MONGO: AUTH_FAILED",
  26: "MONGO: NS_NOT_FOUND",
  211: "MONGO: KEY_NOT_FOUND",
};

const REDIS_ERROR_CODES: Record<string, string> = {
  ECONNREFUSED: "REDIS:CONNECTION_REFUSED",
  ETIMEDOUT: "REDIS:TIMEOUT",
  ERR: "REDIS:ERROR",
  WRONGTYPE: "REDIS:WRONG_TYPE",
  NOAUTH: "REDIS:AUTH_REQUIRED",
};

const RUNTIME_ERROR_CODES: Record<string, string> = {
  TypeError: "RUNTIME:TYPE_ERROR",
  ReferenceError: "RUNTIME:REFERENCE_ERROR",
  SyntaxError: "RUNTIME:SYNTAX_ERROR",
  RangeError: "RUNTIME:RANGE_ERROR",
  URIError: "RUNTIME:URI_ERROR",
  EvalError: "RUNTIME:EVAL_ERROR",
};

const MYSQL_ERROR_CODES: Record<string, string> = {
  ER_DUP_ENTRY: "MYSQL:DUPLICATE",
  ER_NO_SUCH_TABLE: "MYSQL:NO_TABLE",
  ER_BAD_FIELD_ERROR: "MYSQL:BAD_FIELD",
  ER_ACCESS_DENIED_ERROR: "MYSQL:AUTH_FAILED",
  ECONNREFUSED: "MYSQL:CONNECTION_REFUSED",
  ETIMEDOUT: "MYSQL:TIMEOUT",
};

const getSuggestions = (code: string): string[] => {
  const suggestion: Record<string, string[]> = {
    "PG:CONNECTION_REFUSED": [
      "Check if PostgresSQL server is running",
      "Verify host and port in connection string",
      "Check firewall rules",
    ],
    "PG:TIMEOUT": [
      "Check network connectivity to PostgreSQL server",
      "Increase connection timeout in config",
      "Verify server is not overloeaded",
    ],
    "PG:AUTH_FAILED": [
      "Verify username and password in connection string",
      "Check pg_hba.conf for authentication rules",
    ],
    "PG:UNDEFINED_TABLE": [
      "Run pending migrations",
      "Check table name spelling",
      "Verify you are connect to the correct database",
    ],
    "MONGO:DUPLICATE_KEY": [
      "Check unique indexes on the collection",
      "Verify the document does not already exist",
    ],
    "MONGO:AUTH_FAILED": [
      "Verify MongoDB username and password",
      "Check authentication database name",
    ],
    "RUNTIME:TYPE_ERROR": [
      "Check variable types before using them",
      "Use optional chaining (?.) for nullable values",
      "Add proper null checks",
    ],
    "RUNTIME:REFERENCE_ERROR": [
      "Check variable is declared before use",
      "Verify import statements are correct",
    ],
    "REDIS:CONNECTION_REFUSED": [
      "Check if Redis server is running",
      "Verify host and port in connection string",
    ],
    "REDIS:AUTH_REQUIRED": [
      "Provide password in Redis connection string",
      "Check requirepass in redis.conf",
    ],
    "MYSQL:CONNECTION_REFUSED": [
      "Check if MySQL server is running",
      "Verify host and port in connection string",
    ],
    "MYSQL:AUTH_FAILED": [
      "Verify MySQL username and password",
      "Check user privileges with SHOW GRANTS",
    ],
  };

  return suggestion[code] || ["Check the error message above for more details"];
};

const detectErrorType = (
  error: Error & Record<string, unknown>,
): { code: string; db?: string; host?: string } => {
  if (error.code && PG_ERROR_CODES[error.code as string]) {
    return {
      code: PG_ERROR_CODES[error.code as string],
      db: "PostgreSQL",
      host: (error.host as string) || "localhost: 5432",
    };
  }

  if (error.name === "MongoServerError" || error.name === "MongoNetworkError") {
    const mongoCode = error.code as number;
    return {
      code: MONGO_ERROR_CODES[mongoCode] || "MONGO:ERROR",
      db: "MongoDB",
      host: (error.hostname as string) || "localhost:27017",
    };
  }

  if (error.code && MYSQL_ERROR_CODES[error.code as string]) {
    return {
      code: MYSQL_ERROR_CODES[error.code as string],
      db: "MySQL",
      host: `${error.host || "localhost"}: ${error.port || 3306}`,
    };
  }

  if (
    error.name === "ReplyError" ||
    (error.code && REDIS_ERROR_CODES[error.code as string])
  ) {
    return {
      code: REDIS_ERROR_CODES[error.code as string] || "REDIS:ERROR",
      db: "Redis",
      host: "localhost:6379",
    };
  }

  if (RUNTIME_ERROR_CODES[error.name]) {
    return { code: RUNTIME_ERROR_CODES[error.name] };
  }

  return { code: "RUNTIME:UNKNOWN" };
};

export const formatRuntimeError = (error: Error): string => {
  const lines: string[] = [];
  const detected = detectErrorType(error as Error & Record<string, unknown>);
  const { code, db, host } = detected;
  const suggestions = getSuggestions(code);

  lines.push(
    chalk.red.bold(`error`) +
      chalk.yellow(`[${code}]: `) +
      chalk.white.bold(error.message),
  );

  if (db && host) {
    lines.push(chalk.cyan(`  --> `) + chalk.blueBright(`${db} @ ${host}`));
  } else if (error.stack) {
    const stackLine = error.stack.split("\n")[1]?.trim() || "";
    lines.push(chalk.cyan(`  --> `) + chalk.blueBright(stackLine));
  }

  lines.push(chalk.cyan(`   |`));

  suggestions.forEach((suggestion, i) => {
    if (i === 0) {
      lines.push(chalk.cyan(`   | `) + chalk.dim(`└─ ${suggestion}`));
    } else {
      lines.push(chalk.cyan(`   | `) + chalk.dim(`   └─ ${suggestion}`));
    }
  });

  lines.push(chalk.cyan(`   |`));
  lines.push("");

  return lines.join("\n");
};

export const formatRuntimeErrors = (errors: Error[]): string => {
  const output = errors.map(formatRuntimeError).join("\n");
  const errorCount = errors.length;
  const summary = chalk.red(
    `Found ${errorCount} runtime error${errorCount > 1 ? "s" : ""}`,
  );
  return `${output}\n${summary}`;
};
