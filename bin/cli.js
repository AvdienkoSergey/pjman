#!/usr/bin/env node

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { program } from "commander";
import { executePlugin, handleUndo, handleDelete, handleClear } from "../utils/cli.js";
import { configFile } from "../utils/paths.js";
import { readFile } from "fs/promises";
import readline from 'node:readline';

// Package Json
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(join(__dirname, "..", "package.json"), "utf8")
);
const version = packageJson.version;
const homepage = packageJson.homepage;

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
  .command("doc")
  .description("Open the project documentation")
  .action(async () => {
    try {
      const { default: open } = await import('open');
      await open(homepage);
    } catch (error) {
      console.error("Error:", error.message);
    }
  })

program 
  .command("ui")
  .description("Open the interface in a browser")
  .action(async () => {
    try {
      await import('../main.js');
      const { default: open } = await import('open');
      const config = await readFile(configFile, 'utf-8');
      const configJson = JSON.parse(config)
      await open(`http://localhost:${configJson.ports.static}`);
    } catch (error) {
      console.error("Error:", error.message);
    }
  })

program 
  .command("operation [options...]")
  .alias("o")
  .description("Actions on operations")
  .option("-l, --list", "History all operations")
  .option("-c, --clear", "Clear history")
  .option("-d, --delete [commandId]", "Delete operation by ID")
  .option("-u, --undo [commandId]", "Roll back operation by ID or last")
  .allowUnknownOption(true)
  .action(async (args, options) => {
    try {
      if (args.length > 0 || process.argv.some(arg => /^-[^lduc]/.test(arg))) {
        const optionsMap = {
          'l': { long: 'list', desc: 'List comands all' },
          'u': { long: 'undo', arg: '[commandId]', desc: 'Undo command (with optional ID)' },
          'd': { long: 'delete', arg: '[commandId]', desc: 'Delete by ID' },
          'c': { long: 'clear', desc: 'Clear history' }
        };

        console.log('\n')
        console.log('          Operations Assistant           ')
        console.log('-----------------------------------------')
        console.log('You can use:')
        Object.entries(optionsMap).forEach(([short, opt]) => {
          const arg = opt.arg ? ` ${opt.arg}` : '';
          console.log(`  -${short}, --${opt.long}${arg}`.padEnd(30) + opt.desc);
        });
        console.log("\nExample usage:");
        console.log(`  pjman o -l`);
        console.log(`  pjman o -u <command id>`);
        console.log(`  pjman o -d <command id>`);
        console.log("\nDocumentation:");
        console.log(`  ${homepage}\n`);
        return;
      }

      const { default: operations } = await import("../core/operations/index.js");
      const { Commander } = await import("../core/Commander.js");
      const commander = new Commander(operations);

      if (options.list) {
        commander.showCommands();
        return;
      }

      if (options.clear) {
        await handleClear(commander);
        return;
      }

      if (options.delete && args.length < 1) {
        console.log('\n')
        console.log('          Operations Assistant           ')
        console.log('-----------------------------------------')
        console.log("\x1b[33mPlease specify the ID of the command you want to delete\x1b[0m\n");
        console.log("Example usage:");
        console.log(`  pjman o -d <command id>`);
        console.log("\nDocumentation:");
        console.log(`  ${homepage}\n`);
        return
      }

      if (options.delete) {
        await handleDelete(commander, options.delete);
        return;
      }

      if (options.undo && args.length < 1) {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });
        console.log('\n')
        console.log('          Operations Assistant           ')
        console.log('-----------------------------------------')
        rl.question(`\x1b[33mDo you really want to roll back the last command?\x1b[0m. Y/n \n\n`, async (answer) => {
          rl.close();
          if (answer.toLowerCase() === "y") {
            await handleUndo(commander, options.undo);
          } else {
            process.exit(0);
          }
        });
      } else if (options.undo) {
        await handleUndo(commander, options.undo);
        return;
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  })

program
  .command("plugin [options...]")
  .alias("p")
  .description("Call plugin")
  .option("-n, --name <name>", "plugin name")
  .option("-t, --target <target>", "target file")
  .option("-l, --list", "list all commands")
  .allowUnknownOption(true)
  .action(async (args, options) => {
    try {
      // If unknown options are present, show help
      if (args.length > 0 || process.argv.some(arg => /^-[^ntl]/.test(arg))) {

        const optionsMap = {
          'n': { long: 'name', arg: '<name>', desc: 'Plugin name to execute' },
          't': { long: 'target', arg: '<target>', desc: 'The target file for the plugin being launched (optional)' },
          'l': { long: 'list', desc: 'List allowed plugins' },
        };

        console.log('\n')
        console.log('            Plugin Assistant             ')
        console.log('-----------------------------------------')
        console.log('You can use:')
        Object.entries(optionsMap).forEach(([short, opt]) => {
          const arg = opt.arg ? ` ${opt.arg}` : '';
          console.log(`  -${short}, --${opt.long}${arg}`.padEnd(25) + opt.desc);
        });
        console.log("\nExample usage:");
        console.log(`  pjman p -n backup -t package.json`);
        console.log(`  pjman p -l`);
        console.log("\nDocumentation:");
        console.log(`  ${homepage}\n`);
        return;
      }

      const { default: operations } = await import("../core/operations/index.js");

      if (options.list || !options.name) {
        console.log('\n')
        console.log('            Plugin Assistant             ')
        console.log('-----------------------------------------')
        if (!options.name && !options.list) {
          console.log("\x1b[33mPlease specify the name of the plugin.\x1b[0m\n");
          console.log("Example:")
          console.log(`  pjman p -n backup -t package.json\n`);
        }
        console.log("You can use plugins:");
        Object.keys(operations).forEach(plugin => {
          console.log(`  - ${plugin}`);
        });
        console.log("\nDocumentation:");
        console.log(`  ${homepage}\n`);
        return;
      }

      const { Commander } = await import("../core/Commander.js");
      const commander = new Commander(operations);

      await executePlugin(commander, options.name, options.target);

    } catch (error) {
      console.error("Error:", error.message);
    }
  });

program.parse();
