import assert from "node:assert";
import { describe, it } from "mocha";
import Loader from "../../lib/Loader.js";

describe("Loader", () => {
  describe("#constructor", () => {
    it("should create instance with default values", () => {
      const loader = new Loader();
      assert.deepStrictEqual(loader.sandbox, {});
      assert.deepStrictEqual(loader.options, {});
    });

    it("should create instance with custom sandbox and options", () => {
      const sandbox = { foo: "bar" };
      const options = { timeout: 1000 };
      const loader = new Loader(sandbox, options);
      assert.deepStrictEqual(loader.sandbox, sandbox);
      assert.deepStrictEqual(loader.options, options);
    });
  });

  describe("#loadFile", () => {
    it("should execute code in isolated context", async () => {
      const loader = new Loader({ value: 42 });

      const result = await loader.loadFile("value += 1");
      assert.strictEqual(result, 43);
    });

    it("should not modify frozen sandbox and options", async () => {
      const sandbox = { counter: 0 };
      const options = { timeout: 10 };
      const loader = new Loader(sandbox, options);

      await assert.rejects(async () => {
        loader.sandbox.counter += 1;
        loader.options.timeout = 100;
      }, /Cannot assign to read only property/);

      assert.strictEqual(sandbox.counter, 0);
      assert.strictEqual(loader.options.timeout, 10);
    });

    it("should throw error for invalid code", async () => {
      const loader = new Loader();
      await assert.rejects(
        async () => {
          await loader.loadFile("invalid code {");
        },
        {
          name: "Error",
          message: /Failed to load code:/,
        }
      );
    });

    it("should respect timeout option", async () => {
      const loader = new Loader({}, { timeout: 10 });
      await assert.rejects(async () => {
        await loader.loadFile("while(true){}");
      }, /Script execution timed out/);
    });
  });
});
