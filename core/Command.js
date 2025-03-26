import { randomUUID } from "node:crypto";
import { CommandError } from "../errors/CommandError.js";
import { progressReport } from "./ProgressReport.js";

class Command {
  #execute;
  #undo;

  constructor(target, operation, execute, undo) {
    this.id = randomUUID();
    this.timestamp = this.#localTime()
    this.target = target;
    this.operation = operation;
    this.progress = progressReport;
    this.#execute = execute;
    this.#undo = undo;
  }

  #localTime() {
    return Date.now()
  }

  async execute() {
    try {
      return await this.#execute(this, this.progress);
    } catch (error) {
      const commandError = CommandError.ExecutionFailed(this, error);
      commandError.log();
      throw commandError;
    }
  }

  async undo(cmd) {
    try {
      return await this.#undo(cmd, this.progress);
    } catch (error) {
      const commandError = CommandError.ExecutionFailed(this, error);
      commandError.log();
      throw commandError;
    }
  }
}

export { Command };
