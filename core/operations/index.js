import PluginLoader from "./PluginLoader.js";
import makeBackup from "./makeBackup.js";
import { resolve } from "node:path";
import { readFileSync } from "node:fs";

const isTest = process.env.NODE_ENV === "test";

const getPjmanDir = () => {
  return isTest ? process.env.PJMAN_DIR : ".pjman";
};
const getDirectory = () => {
  return isTest
    ? `${PJMAN_DIR}/plugins`
    : resolve(process.cwd(), `.pjman`, `plugins`);
};
const getConfigPath = () => {
  return isTest
    ? `${PJMAN_DIR}/config.json`
    : resolve(process.cwd(), `.pjman`, `config.json`);
};

const PJMAN_DIR = getPjmanDir();
const directory = getDirectory();
const configPath = getConfigPath();

const config = JSON.parse(readFileSync(configPath, "utf8"));

const sandbox = {};
Object.keys(config.sandbox).forEach((key) => {
  if (config.sandbox[key] === true) {
    sandbox[key] = global[key];
  }
});
const options = config.options;

const loader = new PluginLoader(directory, sandbox, options, isTest);

const plugins = await loader.loadPlugins();

export default {
  ...plugins,
  makeBackup,
};
