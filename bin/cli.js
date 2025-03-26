#!/usr/bin/env node

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { program } from "commander";
import { executePlugin, listAvailablePlugins, handleUndo, handleDelete } from "../utils/cli.js";
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
  .command("plugin [options...]")
  .alias("p")
  .description("Call plugin")
  .option("-n, --name <name>", "plugin name")
  .option("-t, --target <target>", "target file")
  .option("-u, --undo [commandId]", "undo command by ID")
  .option("-l, --list", "list all commands")
  .option("-d, --delete [commandId]", "delete command by ID")
  .allowUnknownOption(true)
  .action(async (args, options) => {
    try {
      // If unknown options are present, show help
      if (args.length > 0 || process.argv.some(arg => /^-[^ntuld]/.test(arg))) {
        const optionsMap = {
          'n': { long: 'name', arg: '<name>', desc: 'Plugin name to execute' },
          't': { long: 'target', arg: '<target>', desc: 'Target file for plugin' },
          'u': { long: 'undo', arg: '[commandId]', desc: 'Undo command (with optional ID)' },
          'l': { long: 'list', desc: 'List all commands' },
          'd': { long: 'delete', desc: 'Delete command by ID' }
        };

        console.log("Available plugin options:");
        Object.entries(optionsMap).forEach(([short, opt]) => {
          const arg = opt.arg ? ` ${opt.arg}` : '';
          console.log(`  -${short}, --${opt.long}${arg}`.padEnd(25) + opt.desc);
        });

        console.log("\nExample usage:");
        console.log(`  pjman plugin -n backup -t ./file.js`);
        console.log(`  pjman plugin -u`);
        console.log(`  pjman plugin -l`);
        return;
      }

      const { Commander } = await import("../core/Commander.js");
      const { default: operations } = await import("../core/operations/index.js");

      const commander = new Commander(operations);

      if (options.list) {
        commander.showCommands();
        return;
      }

      if (options.delete) {
        await handleDelete(commander, options.delete);
        return;
      }

      if (options.undo) {
        await handleUndo(commander, options.undo);
        return;
      }

      if (!options.name) {
        await listAvailablePlugins(operations);
        return;
      }

      // Execute plugin
      await executePlugin(commander, options.name, options.target);

    } catch (error) {
      console.error("Error:", error.message);
    }
  });

program.parse();
