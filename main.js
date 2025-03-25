import { Commander } from "./core/Commander.js";
import operations from "./core/operations/index.js";

const commander = new Commander(operations);
console.log(operations);
console.log(commander);
commander.execute("makeBackup", "package.json");
commander.execute("default", "package.json");
commander.showCommands();
