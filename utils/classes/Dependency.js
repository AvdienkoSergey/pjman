/**
 * @typedef {'production' | 'development'} DependencyType
 * @typedef {'none' | 'low' | 'medium' | 'high' | 'critical'} SecurityRisk
 *
 * @typedef {Object} DependencyVulnerability
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {'low' | 'medium' | 'high' | 'critical'} severity
 * @property {string|null} fixedInVersion
 * @property {string|null} url
 */

export class Dependency {
  /**
   * @param {string} name
   * @param {string} currentVersion
   * @param {DependencyType} [type='production']
   */
  constructor(name, currentVersion, type = "production") {
    this.name = name;
    this.currentVersion = currentVersion;
    this.isUsed = false;
    this.safeUpdateVersion = null;
    this.majorUpdateVersion = null;
    this.repositoryUrl = null;
    this.lastUpdated = null;
    this.description = null;
    this.type = type;
    this.usageCount = 0;
    this.vulnerabilities = [];
    this.license = null;
    this.size = null;
  }

  /**
   * @param {number} [usageCount=1]
   */
  markAsUsed(usageCount = 1) {
    this.isUsed = true;
    this.usageCount = usageCount;
  }

  /** @returns {boolean} */
  hasUpdates() {
    return !!this.safeUpdateVersion || !!this.majorUpdateVersion;
  }

  /**
   * @param {string|null} safeVersion
   * @param {string|null} majorVersion
   */
  setAvailableUpdates(safeVersion, majorVersion) {
    this.safeUpdateVersion = safeVersion;
    this.majorUpdateVersion = majorVersion;
  }

  /**
   * @param {DependencyVulnerability} vulnerability
   */
  addVulnerability(vulnerability) {
    this.vulnerabilities.push(vulnerability);
  }

  /** @returns {SecurityRisk} */
  getSecurityRisk() {
    if (this.vulnerabilities.length === 0) return "none";

    const highestSeverity = Math.max(
      ...this.vulnerabilities.map((v) => this.#getSeverityValue(v.severity))
    );

    switch (highestSeverity) {
      case 4:
        return "critical";
      case 3:
        return "high";
      case 2:
        return "medium";
      case 1:
        return "low";
      default:
        return "none";
    }
  }

  /**
   * @param {'low' | 'medium' | 'high' | 'critical'} severity
   * @returns {number}
   */
  #getSeverityValue(severity) {
    switch (severity) {
      case "critical":
        return 4;
      case "high":
        return 3;
      case "medium":
        return 2;
      case "low":
        return 1;
      default:
        return 0;
    }
  }

  /**
   * Format for display
   */
  toFrontendDisplayObject() {
    const name = (value) => ({
      value,
      tag: "span",
      color: "#212121",
    });
    const status = (value, isUsed) => ({
      value,
      tag: "span",
      color: isUsed ? "#9e9e9e" : "#f44336",
    });
    const current = (value) => ({
      value,
      tag: "span",
      color: "#212121",
    });
    const updates = (value, hasUpdates) => ({
      value,
      tag: "span",
      color: hasUpdates ? "#ffeb3b" : "#9e9e9e",
    });
    const safeUpdate = (value) => ({
      value,
      tag: "span",
      color: value === "-" ? "#9e9e9e" : "#ffeb3b",
    });
    const majorUpdate = (value) => ({
      value,
      tag: "span",
      color: value === "-" ? "#9e9e9e" : "#f44336",
    });
    const security = (value, securityRisk) => {
      const securityRiskColorScheme = {
        none: "#4caf50",
        low: "#ffeb3b",
        medium: "#ffc107",
        high: "#ff9800",
        critical: "#f44336",
      };
      return {
        value,
        tag: "span",
        color: securityRiskColorScheme[securityRisk],
      };
    };
    const link = (value) => ({
      value,
      tag: "a",
      color: value !== "-" ? "#03a9f4" : "#9e9e9e",
    });
    const license = (value) => ({
      value,
      tag: "span",
      color: "#9e9e9e",
    });
    const type = (value) => ({
      value,
      tag: "span",
      color: "#9e9e9e",
    });

    return {
      name: name(this.name),
      status: status(this.isUsed ? "Used" : "Unused", this.isUsed),
      current: current(this.currentVersion),
      updates: updates(
        this.hasUpdates() ? "Available" : "Up to date",
        this.hasUpdates()
      ),
      safeUpdate: safeUpdate(this.safeUpdateVersion || "-"),
      majorUpdate: majorUpdate(this.majorUpdateVersion || "-"),
      security: security(this.getSecurityRisk(), this.getSecurityRisk()),
      link: link(this.repositoryUrl || "-"),
      license: license(this.license || "-"),
      type: type(this.type),
    };
  }

  toBackendDisplayObject() {
    return {
      name: this.name,
      status: this.isUsed ? "Used" : "Unused",
      current: this.currentVersion,
      updates: this.hasUpdates() ? "Available" : "Up to date",
      safeUpdate: this.safeUpdateVersion || "-",
      majorUpdate: this.majorUpdateVersion || "-",
      security: this.getSecurityRisk(),
    };
  }
}
