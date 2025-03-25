import { Command } from "./Command.js";
import { CommandError } from "../errors/CommandError.js";

class Commander {
  constructor(operations) {
    this.commands = [];
    this.operations = operations;
  }

  add(command) {
    this.commands.push(command);
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
      this.add(cmd);
      return void cmd.execute();
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
      return void (await lastCommand.undo());
    }

    if (commandId !== null) {
      const cmd = this.commands.find((cmd) => cmd.id === commandId);
      if (!cmd) {
        const error = CommandError.NotFound(commandId);
        error.log();
        throw error;
      }
      return void (await cmd.undo());
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
}

export { Commander };
