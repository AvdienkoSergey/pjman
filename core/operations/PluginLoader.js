// @ts-check
import { resolve, join } from "node:path";
import { readdir, readFile } from "node:fs/promises";
/** @type {import('../../lib/Loader').default} */
import Loader from "../../lib/Loader.js";
import { PluginError } from "../../errors/PluginError.js";

export default class PluginLoader extends Loader {
  /**
   * @param {string} directory
   * @param {import('../../lib/Loader').LoaderSandbox} [sandbox={}]
   * @param {import('../../lib/Loader').LoaderOptions} [options={}]
   */
  constructor(directory, sandbox = {}, options = {}, isTest = false) {
    super(sandbox, options);
    this.directory = isTest ? directory : resolve(process.cwd(), directory);
    this.plugins = new Map();
  }

  /**
   * Проверяет валидность структуры плагина
   * @param {Object} plugin - Загруженный плагин
   * @returns {boolean} Результат проверки
   */
  validatePlugin(plugin) {
    return plugin &&
      typeof plugin?.execute === "function" &&
      typeof plugin?.undo === "function"
      ? true
      : false;
  }

  /**
   * Загружает все плагины из директории
   * @returns {Promise<Object>} Объект с загруженными плагинами
   */
  async loadPlugins() {
    return this.loadFiles(
      (/** @type {string} */ file) => file.endsWith(".js"),
      this.validatePlugin
    );
  }

  /**
   * Получает загруженный плагин по имени
   * @param {string} name - Имя плагина
   * @returns {Object|undefined} Плагин или undefined если не найден
   */
  getPlugin(name) {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      const error = PluginError.NotFound(name);
      error.log();
      return undefined;
    }
    return plugin;
  }

  /**
   * Получает все загруженные плагины
   * @returns {Object} Объект со всеми плагинами
   */
  getAllPlugins() {
    return this.plugins;
  }

  /**
   * Загружает все файлы из директории
   * @param {Function} filter - Функция фильтрации файлов
   * @param {Function} validate - Функция валидации загруженного содержимого
   * @returns {Promise<Object>} Объект с загруженными файлами
   */
  async loadFiles(
    filter = (/** @type {string} */ file) => file.endsWith(".js"),
    validate = () => true
  ) {
    try {
      const files = await readdir(this.directory);
      const filteredFiles = files.filter((file) => filter(file));

      for (const file of filteredFiles) {
        const split = file.split(".");
        const name = split && split.length > 1 ? split[0] : file;
        const filePath = join(this.directory, file);
        const code = await readFile(filePath, "utf8");
        const content = await this.loadFile(code);

        if (!validate(content)) {
          throw PluginError.InvalidStructure(filePath);
        }

        this.plugins.set(name, content);
      }

      return Object.fromEntries(this.plugins);
    } catch (error) {
      if (error instanceof PluginError) {
        throw error;
      }
      throw PluginError.LoadFailed(error);
    }
  }
}
