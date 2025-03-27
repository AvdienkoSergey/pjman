import { Command } from "./Command.js";
import { CommandError } from "../errors/CommandError.js";
import { readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { commandsFile } from "../utils/paths.js";

class Commander {
  constructor(operations) {
    this.commands = [];
    this.operations = operations;
    this.#restoreCommands();
  }

  #add(command) {
    this.commands.push(command);
    this.#saveCommands();
  }

  #restoreCommands() {
    const commands = readFileSync(commandsFile, "utf8");
    const rawCommands = JSON.parse(commands);
    this.commands = rawCommands.map(cmd => {
      const { execute, undo } = this.operations[cmd.operation];
      const command = new Command(cmd.target, cmd.operation, execute, undo);
      command.id = cmd.id;
      command.timestamp = cmd.timestamp;
      return command;
    });
  }

  #saveCommands() {
    writeFile(commandsFile, JSON.stringify(this.commands, null, 2));
  }

   /**
   * Deletes a command by ID
   * @param {string} commandId - ID of the command to delete
   */
   deleteCommand(commandId) {
    const commandIndex = this.commands.findIndex(cmd => cmd.id === commandId);
    
    if (commandIndex === -1) {
      const error = CommandError.NotFound(commandId);
      error.log();
      throw error;
    }
    
    this.commands.splice(commandIndex, 1);
    this.#saveCommands();
  }

  /**
   * Executes an operation and adds it to the command history
   * @param {string} operation - Operation name
   * @param {any} target - Target object for the operation
   * @returns {Promise<void>}
   */
  async execute(operation, target = null) {
    try {
      const { execute, undo } = this.operations[operation];
      const cmd = new Command(target, operation, execute, undo);
      this.#add(cmd);
      return await cmd.execute();
    } catch (error) {
      const cmd = new Command(
        target,
        operation,
        () => {},
        () => {}
      );
      const commandError = CommandError.ExecutionFailed(cmd, error);
      commandError.log();
      throw commandError;
    }
  }

  async undo(count = 0, commandId = null) {
    if (count === 0 && commandId === null) {
      const lastCommand = this.commands.pop();
      if (!lastCommand) {
        const error = CommandError.NoCommandsToUndo();
        error.log();
        throw error;
      }
      await lastCommand.undo(lastCommand).then(() => {
        this.#saveCommands();
      });
      return;
    }

    if (commandId !== null) {
      const commandIndex = this.commands.findIndex((cmd) => cmd.id === commandId);
      if (commandIndex === -1) {
        const error = CommandError.NotFound(commandId);
        error.log();
        throw error;
      }
      const cmd = this.commands[commandIndex];
      await cmd.undo();
      this.commands.splice(commandIndex, 1);
      this.#saveCommands();
      return;
    }

    const undoPromises = [];
    for (let i = 0; i < Math.min(count, this.commands.length); i++) {
      const command = this.commands.pop();
      undoPromises.push(command.undo());
    }
    return void (await Promise.all(undoPromises));
  }

  showCommands() {
    console.table(this.commands);
  }

  clear() {
    this.commands = [];
    this.#saveCommands();
  }
}

export { Commander };
