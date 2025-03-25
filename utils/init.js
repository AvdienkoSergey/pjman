import { mkdir, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { existsSync } from "node:fs";

const DEFAULT_CONFIG = {
  sandbox: {
    console: true,
  },
  options: {
    timeout: 5000,
    displayErrors: true,
  },
};

const DEFAULT_PLUGIN = `({
  execute: async () => {
    console.log("You can write your code here");
    return true;
  },
  undo: async () => {
    console.log("You can write your code here");
    return true;
  },
});
`;

async function createDirectoryIfNotExists(path) {
  if (!existsSync(path)) {
    await mkdir(path, { recursive: true });
  }
}

async function init() {
  try {
    const pjmanDir = resolve(process.cwd(), ".pjman");
    const pluginsDir = join(pjmanDir, "plugins");

    // Create directories
    await createDirectoryIfNotExists(pjmanDir);
    await createDirectoryIfNotExists(pluginsDir);

    // Create config.json
    const configPath = join(pjmanDir, "config.json");
    if (!existsSync(configPath)) {
      await writeFile(
        configPath,
        JSON.stringify(DEFAULT_CONFIG, null, 2),
        "utf8"
      );
    }

    // Create test plugin
    const testPluginPath = join(pluginsDir, "default.js");
    if (!existsSync(testPluginPath)) {
      await writeFile(testPluginPath, DEFAULT_PLUGIN, "utf8");
    }

    console.log("✨ Project initialized successfully!");
    console.log(`📁 Created directory: ${pjmanDir}`);
    console.log(`📁 Created directory: ${pluginsDir}`);
    console.log(`📄 Created file: ${configPath}`);
    console.log(`📄 Created file: ${testPluginPath}`);
  } catch (error) {
    console.error("❌ Failed to initialize project:", error.message);
    process.exit(1);
  }
}

export default init;
