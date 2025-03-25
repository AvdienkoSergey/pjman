#!/usr/bin/env node

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { program } from "commander";
import { Commander } from "../core/Commander.js";
import operations from "../core/operations/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJson = JSON.parse(
  readFileSync(join(__dirname, "..", "package.json"), "utf8")
);
const version = packageJson.version;

// Настраиваем базовую информацию о CLI
program
  .name("pjman")
  .description("Package management tool for JavaScript applications")
  .version(version);

// Добавляем команды
program
  .command("init")
  .description(
    "Create pjman folder in current directory with default plugins and config.json file"
  )
  .addHelpText("after", "Initialize project. Example: pjman init")
  .action(async () => {
    const { default: init } = await import("../utils/init.js");
    await init();
  });

program
  .command("plugin")
  .alias("p")
  .description("Call plugin")
  .option("-n, --name <name>", "plugin name", "default")
  .option("-t, --target <target>", "target file", "package.json")
  .action(async (options) => {
    const commander = new Commander(operations);
    commander.execute(options.name, options.target);
    commander.execute("makeBackup", "package.json");
    commander.showCommands();
  });

program.parse();
