import assert from "node:assert";
import { describe, it, beforeEach, afterEach } from "mocha";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { resolve } from "node:path";

describe("operations/index", () => {
  const TEST_DIR = ".pjman-test";
  const PLUGINS_DIR = resolve(TEST_DIR, "plugins");
  const CONFIG_PATH = resolve(TEST_DIR, "config.json");
  const ORIGINAL_CWD = process.cwd;

  beforeEach(async () => {
    await mkdir(PLUGINS_DIR, { recursive: true });

    // Create test config
    const config = {
      sandbox: {
        console: true,
        process: false,
      },
      options: {
        timeout: 1000,
      },
    };
    await writeFile(CONFIG_PATH, JSON.stringify(config));

    // Create test plugin
    const testPlugin = `({
      execute: () => "executed",
      undo: () => process.cwd()
    })`;
    await writeFile(resolve(PLUGINS_DIR, "test.js"), testPlugin);

    // Mock process.cwd()
    process.cwd = () => TEST_DIR;

    // Clear require cache
    process.env.PJMAN_TEST_DIR = TEST_DIR;
  });

  afterEach(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
    process.cwd = ORIGINAL_CWD;
  });

  it("should load plugins and default operations", async () => {
    const operations = (await import("../../../core/operations/index.js"))
      .default;

    assert.ok(operations.test, "Should load test plugin");
    assert.strictEqual(typeof operations.test.execute, "function");
    assert.strictEqual(typeof operations.test.undo, "function");

    assert.ok(operations.backup, "Should include backup operation");
    assert.strictEqual(typeof operations.backup.execute, "function");
    assert.strictEqual(typeof operations.backup.undo, "function");
  });

  it("should provide sandbox from config", async () => {
    const operations = (await import("../../../core/operations/index.js"))
      .default;
    const result = await operations.test.execute();
    assert.strictEqual(result, "executed");
  });

  it("should respect sandbox restrictions", async () => {
    const operations = (await import("../../../core/operations/index.js"))
      .default;

    await assert.rejects(
      async () => {
        await operations.test.undo();
      },
      {
        name: "ReferenceError",
        message: /process is not defined/,
      }
    );
  });
});
