import vm from "node:vm";

class Loader {
  constructor(sandbox = {}, options = {}) {
    this.sandbox = Object.freeze(sandbox);
    this.options = Object.freeze(options);
  }

  /**
   * Загружает файл и выполняет его в изолированном контексте
   * @param {string} code - Код файла
   * @returns {Promise<any>} Результат загрузки
   */
  async loadFile(code) {
    try {
      const script = new vm.Script(code);
      const context = vm.createContext(this.sandbox);

      return script.runInContext(context, {
        ...this.options,
      });
    } catch (error) {
      throw new Error(`Failed to load code: ${error.message}`);
    }
  }
}

export default Loader;
