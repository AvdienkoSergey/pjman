import { createDirectoryIfNotExists, createFileIfNotExists } from "./fs.js"
import {
  pjmanDir,
  pluginsDir,
  historyDir,
  backupDir,
  configFile,
  defaultPluginFile,
  commandsFile
} from "./paths.js"

const DEFAULT_CONFIG = {
  sandbox: {
    console: true,
  },
  options: {
    timeout: 5000,
    displayErrors: true,
  },
  ports: {
    static: 4000,
    ws: 4001
  },
  dependencies: []
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

const DEFAULT_COMMANDS = []

async function init() {
  try {

    await createDirectoryIfNotExists(pjmanDir)
      .then((result) => result
        ? console.log(`📁 Created directory: ${pjmanDir}`)
        : null
      )

    await createDirectoryIfNotExists(pluginsDir)
      .then((result) => result
        ? console.log(`📁 Created directory: ${pluginsDir}`)
        : null
      )

    await createDirectoryIfNotExists(historyDir)
      .then((result) => result
        ? console.log(`📁 Created directory: ${historyDir}`)
        : null
      )
    
    await createDirectoryIfNotExists(backupDir)
      .then((result) => result
        ? console.log(`📁 Created directory: ${backupDir}`)
        : null
      )

    await createFileIfNotExists(
      configFile,
      JSON.stringify(DEFAULT_CONFIG, null, 2)
    )
      .then((result) => result
        ? console.log(`📁 Created file: ${configFile}`)
        : null
      )

    await createFileIfNotExists(
      defaultPluginFile,
      DEFAULT_PLUGIN
    )
      .then((result) => result
        ? console.log(`📁 Created file: ${defaultPluginFile}`)
        : null
      )

    await createFileIfNotExists(
      commandsFile,
      JSON.stringify(DEFAULT_COMMANDS, null, 2)
    )
      .then((result) => result
        ? console.log(`📁 Created file: ${commandsFile}`)
        : null
      )

  } catch (error) {
    console.error("❌ Failed to initialize project:", error.message);
    process.exit(1);
  }
}

export default init;
