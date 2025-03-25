import assert from "node:assert";
import { describe, it, beforeEach, afterEach } from "mocha";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import PluginLoader from "../../../core/operations/PluginLoader.js";

describe("PluginLoader", () => {
  const TEST_DIR = ".plugins-test";
  let pluginLoader;

  beforeEach(async () => {
    await mkdir(TEST_DIR, { recursive: true });
    pluginLoader = new PluginLoader(TEST_DIR);
  });

  afterEach(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  describe("#constructor", () => {
    it("should create instance with default values", () => {
      assert.strictEqual(pluginLoader.plugins.size, 0);
      assert.ok(pluginLoader.directory.endsWith(TEST_DIR));
    });
  });

  describe("#validatePlugin", () => {
    it("should validate correct plugin structure", () => {
      const validPlugin = {
        execute: () => {},
        undo: () => {},
      };
      assert.strictEqual(pluginLoader.validatePlugin(validPlugin), true);
    });

    it("should reject invalid plugin structure", () => {
      const invalidPlugins = [
        { execute: () => {} },
        { undo: () => {} },
        { execute: "not-a-function", undo: () => {} },
        null,
        undefined,
      ];

      invalidPlugins.forEach((plugin) => {
        assert.strictEqual(pluginLoader.validatePlugin(plugin), false);
      });
    });
  });

  describe("#loadFiles", () => {
    it("should load valid plugin files", async () => {
      const validPlugin = `
        ({
          execute: () => "executed",
          undo: () => "undone"
        })
      `;

      await writeFile(join(TEST_DIR, "valid.js"), validPlugin);

      const plugins = await pluginLoader.loadFiles();
      assert.strictEqual(pluginLoader.plugins.size, 1);
      assert.ok(pluginLoader.plugins.has("valid"));

      const plugin = pluginLoader.plugins.get("valid");
      assert.strictEqual(typeof plugin.execute, "function");
      assert.strictEqual(typeof plugin.undo, "function");
    });

    it("should throw on invalid plugin structure", async () => {
      const invalidPlugin = `
          ({
            execute: "not-a-function"
          })
        `;

      await writeFile(join(TEST_DIR, "invalid.js"), invalidPlugin);

      await assert.rejects(
        async () => {
          await pluginLoader.loadPlugins();
        },
        {
          message: /Invalid content structure/,
        }
      );
    });

    it("should respect custom filter", async () => {
      await writeFile(
        join(TEST_DIR, "plugin.js"),
        `({
        execute: () => {},
        undo: () => {},
      })`
      );
      await writeFile(
        join(TEST_DIR, "plugin.mjs"),
        `({
        execute: () => {},
        undo: () => {},
      })`
      );

      const plugins = await pluginLoader.loadFiles((file) =>
        file.endsWith(".mjs")
      );

      assert.strictEqual(pluginLoader.plugins.size, 1);
      assert.ok(pluginLoader.plugins.has("plugin"));
    });
  });

  describe("#getPlugin", () => {
    it("should return plugin by name", async () => {
      const plugin = `
        ({
          execute: () => {},
          undo: () => {}
        })
      `;

      await writeFile(join(TEST_DIR, "test.js"), plugin);
      await pluginLoader.loadPlugins();

      const loadedPlugin = pluginLoader.getPlugin("test");
      assert.ok(loadedPlugin);
      assert.strictEqual(typeof loadedPlugin.execute, "function");
    });

    it("should return undefined for non-existent plugin", () => {
      assert.strictEqual(pluginLoader.getPlugin("non-existent"), undefined);
    });
  });

  describe("#getAllPlugins", () => {
    it("should return map of all loaded plugins", async () => {
      const plugin = `
        ({
          execute: () => {},
          undo: () => {}
        })
      `;

      await writeFile(join(TEST_DIR, "plugin1.js"), plugin);
      await writeFile(join(TEST_DIR, "plugin2.js"), plugin);

      await pluginLoader.loadPlugins();
      const plugins = pluginLoader.getAllPlugins();

      assert.ok(plugins instanceof Map);
      assert.strictEqual(plugins.size, 2);
      assert.ok(plugins.has("plugin1"));
      assert.ok(plugins.has("plugin2"));
    });
  });
});
