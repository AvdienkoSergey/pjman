import PluginLoader from "./PluginLoader.js";
import backup from "./backup.js";
import dependencyAnalyzer from "./dependencyAnalyzer.js";
import { readFileSync } from "node:fs";
import {
  pjmanDir,
  pluginsDir,
  configFile,
} from "../../utils/paths.js"

const isTest = process.env.NODE_ENV === "test";

function getPjmanDir() {
  return isTest ? process.env.PJMAN_TEST_DIR : pjmanDir;
};
function getDirectory() {
  return isTest ? `${PJMAN_DIR}/plugins` : pluginsDir;
};
function getConfigPath() {
  return isTest ? `${PJMAN_DIR}/config.json` : configFile;
};

const PJMAN_DIR = getPjmanDir();
const directory = getDirectory();
const configPath = getConfigPath();

const config = JSON.parse(readFileSync(configPath, "utf8"));

const sandbox = {};

for (const key of Object.keys(config.sandbox)) {
  if (config.sandbox[key] === true) {
    sandbox[key] = await import(`${key}`);
  }
}
const options = config.options;

const loader = new PluginLoader(directory, sandbox, options, isTest);

const plugins = await loader.loadPlugins();

export default {
  ...plugins,
  backup,
  analyze: dependencyAnalyzer,
};
