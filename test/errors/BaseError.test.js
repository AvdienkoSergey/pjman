import assert from "node:assert";
import { describe, it } from "mocha";
import { BaseError } from "../../errors/BaseError.js";

describe("BaseError", () => {
  describe("#constructor", () => {
    it("should create error with default values", () => {
      const error = new BaseError("TestError", "test message");

      assert.strictEqual(error.name, "TestError");
      assert.strictEqual(error.message, "test message");
      assert.strictEqual(error.code, "ERROR");
      assert.strictEqual(error.target, null);
      assert.deepStrictEqual(error.context, {});
      assert.ok(error.timestamp instanceof Date);
    });

    it("should create error with custom values", () => {
      const target = { id: 1 };
      const context = { extra: "info" };
      const error = new BaseError(
        "CustomError",
        "custom message",
        target,
        "CUSTOM_CODE",
        context
      );

      assert.strictEqual(error.name, "CustomError");
      assert.strictEqual(error.message, "custom message");
      assert.strictEqual(error.code, "CUSTOM_CODE");
      assert.deepStrictEqual(error.target, target);
      assert.deepStrictEqual(error.context, context);
    });

    it("should extend Error class", () => {
      const error = new BaseError("TestError", "test");
      assert.ok(error instanceof Error);
      assert.ok(error instanceof BaseError);
    });
  });

  describe("#log", () => {
    it("should log error details", () => {
      const logs = [];
      const mockLogger = {
        error: (data) => logs.push(data),
      };

      const error = new BaseError("TestError", "test message");
      error.setLogger(mockLogger);
      error.log();

      assert.strictEqual(logs.length, 1);
      const log = logs[0];

      assert.strictEqual(log.name, "TestError");
      assert.strictEqual(log.message, "test message");
      assert.strictEqual(log.code, "ERROR");
      assert.strictEqual(log.target, null);
      assert.ok(log.timestamp instanceof Date);
      assert.deepStrictEqual(log.context, {});
    });

    it("should log error with all custom details", () => {
      const logs = [];
      const mockLogger = {
        error: (data) => logs.push(data),
      };

      const target = { id: 1 };
      const context = { extra: "info" };
      const error = new BaseError(
        "CustomError",
        "custom message",
        target,
        "CUSTOM_CODE",
        context
      );
      error.setLogger(mockLogger);
      error.log();

      assert.strictEqual(logs.length, 1);
      const log = logs[0];

      assert.strictEqual(log.name, "CustomError");
      assert.strictEqual(log.message, "custom message");
      assert.strictEqual(log.code, "CUSTOM_CODE");
      assert.deepStrictEqual(log.target, target);
      assert.deepStrictEqual(log.context, context);
    });
  });
});
