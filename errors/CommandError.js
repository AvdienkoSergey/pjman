import { BaseError } from "./BaseError.js";

class CommandError extends BaseError {
  constructor(message, command = null, code = "COMMAND_ERROR", context = {}) {
    super("CommandError", message, command, code, context);
  }

  static NotFound(commandId) {
    return new CommandError(
      `Command with id ${commandId} not found`,
      null,
      "COMMAND_NOT_FOUND",
      { commandId }
    );
  }

  static NoCommandsToUndo() {
    return new CommandError("No commands to undo", null, "NO_COMMANDS_TO_UNDO");
  }

  static ExecutionFailed(command, error) {
    return new CommandError(
      `Failed to execute command: ${error.message}`,
      command,
      "EXECUTION_FAILED",
      { originalError: error }
    );
  }
}

export { CommandError };
