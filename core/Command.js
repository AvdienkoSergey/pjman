import { randomUUID } from "node:crypto";
import { CommandError } from "../errors/CommandError.js";

class Command {
  #execute;
  #undo;

  constructor(target, operation, execute, undo) {
    this.id = randomUUID();
    this.target = target;
    this.operation = operation;
    this.#execute = execute;
    this.#undo = undo;
  }

  async execute() {
    try {
      console.log("execute", this);
      return await this.#execute();
    } catch (error) {
      const commandError = CommandError.ExecutionFailed(this, error);
      commandError.log();
      throw commandError;
    }
  }

  async undo() {
    try {
      return await this.#undo();
    } catch (error) {
      const commandError = CommandError.ExecutionFailed(this, error);
      commandError.log();
      throw commandError;
    }
  }
}

export { Command };
