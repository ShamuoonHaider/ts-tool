# ts-blame 🦀

> A TypeScript CLI tool with **Rust-like error output** — beautiful, readable, and self-declarative errors for any TypeScript project.

![ts-blame demo](https://img.shields.io/badge/TypeScript-CLI-blue?style=flat-square&logo=typescript)
![npm version](https://img.shields.io/npm/v/ts-blame?style=flat-square)
![license](https://img.shields.io/badge/license-MIT-green?style=flat-square)
![pnpm](https://img.shields.io/badge/pnpm-ready-orange?style=flat-square)

---

## Why ts-blame?

TypeScript errors are notoriously hard to read. `tsc` gives you walls of text with no visual hierarchy. `ts-blame` fixes that — inspired by the Rust compiler, it gives you **clear, colorful, self-explanatory errors** right in your terminal.

```
error[TS2345]: Argument of type 'string' is not assignable to parameter of type 'number'.
  --> src/index.ts:12:5
   |
12 | add("hello", 2);
   |     ^^^^^^^

✖ Found 1 error
```

It also handles **runtime errors**, **DB connection failures**, and **timeouts** — all formatted the same way.

```
error[MONGO:AUTH_FAILED]: Authentication failed
  --> MongoDB @ localhost:27017
   |
   | └─ Verify MongoDB username and password
   |    └─ Check authentication database name
   |
```

---

## Features

- 🦀 **Rust-like error output** — file path, line number, source line, and pointer
- 🎨 **Syntax highlighted** — colors that actually mean something
- 🗄️ **DB error handling** — PostgreSQL, MongoDB, MySQL, Redis
- ⚡ **Runtime error formatting** — TypeError, ReferenceError, and more
- 👀 **Watch mode** — re-checks on file save
- 🏃 **Run mode** — execute TS files with pretty error output
- 🔍 **Works on any TS project** — React, Next.js, Express, NestJS, Vite, and more

---

## Installation

```bash
# install globally with pnpm
pnpm add -g ts-blame

# or with npm
npm install -g ts-blame

# or with yarn
yarn global add ts-blame
```

---

## Usage

### Check a single file

```bash
ts-blame check src/index.ts
```

### Check entire project

```bash
ts-blame check --all
```

### Run a TypeScript file

```bash
ts-blame run src/index.ts
```

### Watch mode — re-check on save

```bash
ts-blame watch src/index.ts
```

### Run with watch mode

```bash
ts-blame run src/index.ts --watch
```

### Debug mode

```bash
DEBUG=ts-blame:* ts-blame check src/index.ts
```

---

## Error Types Supported

### TypeScript Errors
All `tsc` diagnostic errors with Rust-like formatting.

### Runtime Errors
| Error | Code |
|-------|------|
| TypeError | `RUNTIME:TYPE_ERROR` |
| ReferenceError | `RUNTIME:REFERENCE_ERROR` |
| SyntaxError | `RUNTIME:SYNTAX_ERROR` |
| RangeError | `RUNTIME:RANGE_ERROR` |

### PostgreSQL Errors
| Error | Code |
|-------|------|
| Connection refused | `PG:CONNECTION_REFUSED` |
| Auth failed | `PG:AUTH_FAILED` |
| Undefined table | `PG:UNDEFINED_TABLE` |
| Duplicate entry | `PG:DUPLICATE` |
| Timeout | `PG:TIMEOUT` |

### MongoDB Errors
| Error | Code |
|-------|------|
| Duplicate key | `MONGO:DUPLICATE_KEY` |
| Auth failed | `MONGO:AUTH_FAILED` |
| Unauthorized | `MONGO:UNAUTHORIZED` |
| Network error | `MONGO:NS_NOT_FOUND` |

### MySQL Errors
| Error | Code |
|-------|------|
| Connection refused | `MYSQL:CONNECTION_REFUSED` |
| Auth failed | `MYSQL:AUTH_FAILED` |
| No table | `MYSQL:NO_TABLE` |
| Duplicate entry | `MYSQL:DUPLICATE` |

### Redis Errors
| Error | Code |
|-------|------|
| Connection refused | `REDIS:CONNECTION_REFUSED` |
| Auth required | `REDIS:AUTH_REQUIRED` |
| Wrong type | `REDIS:WRONG_TYPE` |
| Timeout | `REDIS:TIMEOUT` |

---

## Works With Any Framework

Since `ts-blame` uses the TypeScript compiler API and reads your project's own `tsconfig.json`, it works with any TypeScript project:

- ✅ React / Next.js
- ✅ Express / Fastify / NestJS
- ✅ Plain TypeScript
- ✅ Vite / Remix / SvelteKit
- ✅ Any `tsconfig.json` based project

Just run it from your project root:

```bash
cd my-nextjs-app
ts-blame check
```

---

## Contributing

Contributions are welcome! Here's how to get started:

```bash
# clone the repo
git clone git@github.com:ShamuoonHaider/ts-blame.git
cd ts-blame

# install dependencies
pnpm install

# run in dev mode
pnpm dev --help

# run tests
pnpm test
```

### Project Structure

```
ts-blame/
├── bin/
│   └── index.ts          # CLI entry point
├── src/
│   ├── commands/
│   │   ├── check.ts      # type check command
│   │   ├── run.ts        # run command
│   │   └── watch.ts      # watch command
│   ├── formatter/
│   │   ├── error.ts      # TypeScript error formatter
│   │   └── runtime.ts    # runtime/DB error formatter
│   └── utils/
│       └── logger.ts     # logger utility
├── tsconfig.json
└── package.json
```

### Adding a New Error Type

1. Add error codes to `src/formatter/runtime.ts`
2. Add suggestions for the new error codes
3. Add detection logic in `detectErrorType()`
4. Submit a PR!

---

## Roadmap

- [ ] `ts-blame check --all` with project-wide summary
- [ ] JSON output mode for CI/CD pipelines
- [ ] VS Code extension
- [ ] Support for `deno` and `bun`
- [ ] Custom error formatters via config file
- [ ] Plugin system for custom DB error handlers

---

## License

MIT © [Shamuoon Haider](https://github.com/ShamuoonHaider)

---

<p align="center">Built with ❤️ and inspired by 🦀 Rust</p>
