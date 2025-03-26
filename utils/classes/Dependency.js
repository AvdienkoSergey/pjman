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
    constructor(name, currentVersion, type = 'production') {
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
    hasUpdates(){
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
      if (this.vulnerabilities.length === 0) return 'none';
      
      const highestSeverity = Math.max(
        ...this.vulnerabilities.map(v => this.#getSeverityValue(v.severity))
      );
      
      switch (highestSeverity) {
        case 4: return 'critical';
        case 3: return 'high';
        case 2: return 'medium';
        case 1: return 'low';
        default: return 'none';
      }
    }
  
    /**
     * @param {'low' | 'medium' | 'high' | 'critical'} severity
     * @returns {number}
     */
    #getSeverityValue(severity) {
      switch (severity) {
        case 'critical': return 4;
        case 'high': return 3;
        case 'medium': return 2;
        case 'low': return 1;
        default: return 0;
      }
    }
  
    /**
     * Format for display
     */
    toDisplayObject() {
      return {
        name: this.name,
        status: this.isUsed ? 'Used' : 'Unused',
        current: this.currentVersion,
        updates: this.hasUpdates() ? 'Available' : 'Up to date',
        safeUpdate: this.safeUpdateVersion || '-',
        majorUpdate: this.majorUpdateVersion || '-',
        security: this.getSecurityRisk(),
        license: this.license || 'Unknown',
        type: this.type
      };
    }
  }
