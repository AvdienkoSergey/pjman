import { BaseError } from "./BaseError.js";

class PluginError extends BaseError {
  constructor(message, plugin = null, code = "PLUGIN_ERROR", context = {}) {
    super("PluginError", message, plugin, code, context);
  }

  static InvalidStructure(filePath) {
    return new PluginError(
      `Invalid content structure in ${filePath}`,
      null,
      "INVALID_PLUGIN_STRUCTURE",
      { filePath }
    );
  }

  static LoadFailed(error) {
    return new PluginError(
      `Failed to load files: ${error.message}`,
      null,
      "PLUGIN_LOAD_FAILED",
      { originalError: error }
    );
  }

  static NotFound(pluginName) {
    return new PluginError(
      `Plugin ${pluginName} not found`,
      null,
      "PLUGIN_NOT_FOUND",
      { pluginName }
    );
  }
}

export { PluginError };
