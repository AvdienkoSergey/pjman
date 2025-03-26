import init from "../../utils/init.js";
import { resolve } from "node:path"
import { backupDir } from "../../utils/paths.js";
import { writeFile, readFile, unlink } from "node:fs/promises"
import { cwd } from "process"
import { existsSync } from "node:fs"

function getBackupPath(cmd) {
  return resolve(backupDir, cmd.id);
}

function getTargetFilePath(cmd) {
  return resolve(cwd(), cmd.target);
}

async function getTargetContent(cmd) {
  const targetFilePath = getTargetFilePath(cmd);
  const content = await readFile(targetFilePath, "utf-8");
  return content;
}

async function getBackupContent(cmd) {
  const backupPath = getBackupPath(cmd);
  const content = await readFile(backupPath, "utf-8");
  return content;
}

function validateTargetFile(cmd) {
  const targetFilePath = getTargetFilePath(cmd);
  if (!existsSync(targetFilePath)) {
    throw new Error("Target file not found");
  }
}

function validateBackupFile(cmd) {
  const backupPath = getBackupPath(cmd);
  if (!existsSync(backupPath)) {
    throw new Error("Backup file not found");
  }
}

export default {
  execute: async (cmd) => {
    try {
      init();
      validateTargetFile(cmd);
      const content = await getTargetContent(cmd);
      const backupPath = getBackupPath(cmd);
      await writeFile(backupPath, content);
      return void 0;
    } catch (error) {
      throw new Error("Failed to backup file");
    }
  },
  undo: async (cmd) => {
    try {
      validateBackupFile(cmd);
      validateTargetFile(cmd);
      const backupPath = getBackupPath(cmd);
      const targetFilePath = getTargetFilePath(cmd);
      const content = await getBackupContent(cmd);
      await writeFile(targetFilePath, content);
      await unlink(backupPath);
      return void 0;
    } catch (error) {
      throw new Error("Failed to undo backup");
    }
  },
};
