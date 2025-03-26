import { cwd } from "node:process"
import { resolve, join } from "node:path"

const pjmanDir = resolve(cwd(), ".pjman");
const pluginsDir = join(pjmanDir, "plugins");
const historyDir = join(pjmanDir, "history");
const backupDir = join(pjmanDir, "backup");
const configFile = join(pjmanDir, "config.json");
const defaultPluginFile = join(pluginsDir, "default.js");
const commandsFile = join(historyDir, "commands.json");

export {
    pjmanDir,
    pluginsDir,
    historyDir,
    backupDir,
    configFile,
    defaultPluginFile,
    commandsFile
}