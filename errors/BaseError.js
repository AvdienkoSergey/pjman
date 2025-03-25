class BaseError extends Error {
  #logger = process.env.NODE_ENV === "test" ? null : console;

  constructor(name, message, target = null, code = "ERROR", context = {}) {
    super(message);
    this.name = name;
    this.code = code;
    this.target = target;
    this.context = context;
    this.timestamp = new Date();
  }

  setLogger(value) {
    if (process.env.NODE_ENV !== "test") return;
    this.#logger = value;
  }

  log() {
    if (this.#logger === null) return;

    this.#logger.error({
      name: this.name,
      code: this.code,
      message: this.message,
      target: this.target,
      timestamp: this.timestamp,
      context: this.context,
    });
  }
}

export { BaseError };
