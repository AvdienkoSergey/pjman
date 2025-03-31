import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { cwd } from "process";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { globby } from "globby";
import { configFile } from "../../utils/paths.js";
import { Dependency } from "../../utils/classes/Dependency.js";

const execAsync = promisify(exec);

async function analyzePackageJson(filePath) {
  const content = await readFile(filePath, "utf-8");
  const packageJson = JSON.parse(content);
  return {
    dependencies: packageJson.dependencies || {},
    devDependencies: packageJson.devDependencies || {},
  };
}

async function getExcludedDependencies() {
  try {
    const content = await readFile(configFile, "utf-8");
    const config = JSON.parse(content);
    return new Set(config.dependencies || []);
  } catch (error) {
    console.error(
      "Warning: Could not read excluded dependencies from config:",
      error.message
    );
    return new Set();
  }
}

async function analyzeSecurity(name) {
  let _stdout = null;
  try {
    const { stdout } = await execAsync("npm audit --json --registry=https://registry.npmjs.org/", {
      env: { ...process.env, NODE_TLS_REJECT_UNAUTHORIZED: "0" },
    });
    _stdout = stdout;
  } catch (error) {
    if (error?.stdout) {
      const { stdout } = error;
      _stdout = stdout;
    } else {
      return []
    }
  }

  const auditData = JSON.parse(_stdout);
  const vulnerabilitiesMap = new Map();

  if (auditData?.vulnerabilities) {
    Object.entries(auditData.vulnerabilities).forEach(([key, value]) => {
      vulnerabilitiesMap.set(key, value)
    })
  }
  return vulnerabilitiesMap;
}

async function analyzeUsage(name, files) {
  let usageCount = 0;
  for (const file of files) {
    const content = await readFile(file, "utf-8");
    if (
      content.includes(`from '${name}'`) ||
      content.includes(`from "${name}"`) ||
      content.includes(`require('${name}')`) ||
      content.includes(`require("${name}")`)
    ) {
      usageCount++;
    }
  }
  return usageCount;
}

async function checkUpdates(name, currentVersion) {
  try {
    const { stdout } = await execAsync(`npm view ${name} version`);
    const latestVersion = stdout.trim();
    const cleanVersion = currentVersion.replace(/[\^~]/g, "");

    if (latestVersion !== cleanVersion) {
      const [currentMajor] = cleanVersion.split(".");
      const [latestMajor] = latestVersion.split(".");

      return {
        hasSafeUpdate: currentMajor === latestMajor,
        latestVersion,
      };
    }
  } catch (error) {
    console.error(`Failed to check updates for ${name}:`, error);
  }
  return null;
}

async function getLicenseInfo(name) {
  try {
    const { stdout } = await execAsync(
      `npm view ${name} license repository.url`
    );
    const lines = stdout.trim().split("\n");
    const info = { license: null, repositoryUrl: null };

    lines.forEach((line) => {
      if (!info.license && line && !line.includes("repository")) {
        info.license = line.trim();
      }
      if (!info.repositoryUrl && line.includes("http")) {
        info.repositoryUrl = line
          .trim()
          .replace("git+", "")
          .replace(".git", "");
      }
    });
    return info;
  } catch (error) {
    console.error(`Failed to analyze license for ${name}:`, error);
    return { license: null, repositoryUrl: null };
  }
}

async function analyzeSingleDependency(
  name,
  version,
  type,
  files,
  excludedDeps
) {
  const dep = new Dependency(name, version, type);

  // Проверка исключений
  if (excludedDeps.has(name)) {
    dep.markAsUsed();
    return dep;
  }

  // Анализ использования
  const usageCount = await analyzeUsage(name, files);
  if (usageCount > 0) {
    dep.markAsUsed(usageCount);
  }

  // Проверка обновлений
  const updates = await checkUpdates(name, version);
  if (updates) {
    dep.setAvailableUpdates(
      updates.hasSafeUpdate ? updates.latestVersion : null,
      updates.hasSafeUpdate ? null : updates.latestVersion
    );
  }

  // Информация о лицензии
  const licenseInfo = await getLicenseInfo(name);
  dep.license = licenseInfo.license?.split("'")[1];
  dep.repositoryUrl = licenseInfo.repositoryUrl?.split("'")[1];
  return dep;
}

async function analyzeDependencies(
  dependencies,
  type = "production",
  progress,
  plugin
) {
  const files = await globby([
    "**/*.js",
    "**/*.ts",
    "**/*.jsx",
    "**/*.tsx",
    "!node_modules/**",
  ]);
  const excludedDeps = await getExcludedDependencies();
  const totalDeps = Object.keys(dependencies).length;
  const stepSize = Math.floor(50 / totalDeps);

  const analysisPromises = Object.entries(dependencies).map(
    async ([name, version]) => {
      const dep = await analyzeSingleDependency(
        name,
        version,
        type,
        files,
        excludedDeps
      );
      // Обновляем прогресс после завершения каждого анализа
      progress.increment(`Analyzing ${name}`, stepSize, plugin);
      return dep;
    }
  );

  const deps = await Promise.all(analysisPromises);

  return deps;
}

async function generateReport(packageJsonPath, progress, plugin) {
  const { dependencies, devDependencies } = await analyzePackageJson(
    packageJsonPath
  );

  const prodDeps = await analyzeDependencies(
    dependencies,
    "production",
    progress,
    plugin
  );
  const devDeps = await analyzeDependencies(
    devDependencies,
    "development",
    progress,
    plugin
  );

  // Проверка безопасности
  const vulnerabilitiesMap = await analyzeSecurity();

  if (vulnerabilitiesMap.size > 0) {
    return {
      production: prodDeps.map((dep) => {
        if (vulnerabilitiesMap.has(dep.name)) {
          dep.addVulnerability(vulnerabilitiesMap.get(dep.name))
        }
        return dep;
      }),
      development: devDeps.map((dep) => {
        if (vulnerabilitiesMap.has(dep.name)) {
          dep.addVulnerability(vulnerabilitiesMap.get(dep.name))
        }
        return dep;
      }),
    }
  }
  return {
    production: prodDeps,
    development: devDeps,
  };
}

export default {
  execute: async (cmd, progress) => {
    try {
      progress.start(cmd.operation);

      const packageJsonPath = resolve(cwd(), "package.json");
      const report = await generateReport(
        packageJsonPath,
        progress,
        cmd.operation
      );

      function getColumns(report) {
        const columns = [];
        const dep =
          report.production.length > 0
            ? report.production[0]
            : report.development.length > 0
              ? report.development[0]
              : null;

        if (!dep) {
          return [];
        }

        Object.keys(dep.toFrontendDisplayObject()).forEach((key) => {
          columns.push(key);
        });
        return columns;
      }

      const result = {
        columns: getColumns(report),
        production: report.production.map((dep) =>
          dep.toFrontendDisplayObject()
        ),
        development: report.development.map((dep) =>
          dep.toFrontendDisplayObject()
        ),
      };

      progress.complete(result, cmd.operation);

      console.log("\n");
      console.table([
        ...report.production.map((dep) => dep.toBackendDisplayObject()),
        ...report.development.map((dep) => dep.toBackendDisplayObject()),
      ]);

      return result;
    } catch (error) {
      console.log(error);
      progress.error(error);
      throw error;
    }
  },
  undo: async () => {
    return void 0;
  },
};
