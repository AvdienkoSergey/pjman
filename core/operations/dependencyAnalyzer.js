import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { cwd } from 'process';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { globby } from 'globby';
import { configFile } from '../../utils/paths.js';
import { Dependency } from '../../utils/classes/Dependency.js';
import ProgressReport from '../../utils/classes/ProgressReport.js';

// // CLI usage
// npx pjman plugin -n analyze

// // Programmatic usage
// const result = await analyzer.execute(cmd, (progress) => {
//     console.log(`${progress.percentage}% - ${progress.message}`);
// });

const execAsync = promisify(exec);


async function analyzePackageJson(filePath) {
    const content = await readFile(filePath, 'utf-8');
    const packageJson = JSON.parse(content);
    return {
        dependencies: packageJson.dependencies || {},
        devDependencies: packageJson.devDependencies || {}
    };
}

async function getExcludedDependencies() {
    try {
        const content = await readFile(configFile, 'utf-8');
        const config = JSON.parse(content);
        return new Set(config.dependencies || []);
    } catch (error) {
        console.error('Warning: Could not read excluded dependencies from config:', error.message);
        return new Set();
    }
}

async function analyzeSecurity(name) {
    try {
        // Try to use npm audit for the package
        const { stdout } = await execAsync('npm audit --json', {
            env: { ...process.env, NODE_TLS_REJECT_UNAUTHORIZED: '0' }
        });
        const auditData = JSON.parse(stdout);
        
        const vulnerabilities = [];
        if (auditData.vulnerabilities && auditData.vulnerabilities[name]) {
            const info = auditData.vulnerabilities[name];
            vulnerabilities.push({
                id: info.cves?.[0] || `NSWG-${info.id}`,
                title: info.title,
                description: info.overview,
                severity: info.severity,
                fixedInVersion: info.fixAvailable?.version || null,
                url: info.url || null
            });
        }
        return vulnerabilities;
    } catch (error) {
        // If npm audit fails, try to get security data from npm view
        try {
            const { stdout } = await execAsync(`npm view ${name} security-holding-pond`);
            if (stdout.trim()) {
                return [{
                    id: 'SECURITY-WARNING',
                    title: 'Security Advisory',
                    description: 'Package has security advisories',
                    severity: 'medium',
                    fixedInVersion: null,
                    url: null
                }];
            }
        } catch (e) {
            // Ignore errors from fallback method
        }
        return [];
    }
}

async function analyzeDependencies(dependencies, type = 'production', progress) {
    const files = await globby(['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx', '!node_modules/**']);
    const excludedDeps = await getExcludedDependencies();
    const deps = [];

    const totalSteps = Object.keys(dependencies).length;
    progress.setTotal(totalSteps);

    for (const [name, version] of Object.entries(dependencies)) {
        progress.updateProgress(`Analyzing ${name}...`);
        const dep = new Dependency(name, version, type);
        
        // Check if dependency is excluded
        if (excludedDeps.has(name)) {
            dep.markAsUsed();
            deps.push(dep);
            progress.increment(`Skipped analysis of ${name} (excluded)`);
            continue;
        }

        progress.updateProgress(`Checking usage of ${name}...`);
        // Check usage in files
        let usageCount = 0;
        for (const file of files) {
            const content = await readFile(file, 'utf-8');
            if (content.includes(`from '${name}'`) ||
                content.includes(`from "${name}"`) ||
                content.includes(`require('${name}')`) ||
                content.includes(`require("${name}")`)) {
                usageCount++;
            }
        }

        if (usageCount > 0) {
            dep.markAsUsed(usageCount);
        }

        progress.updateProgress(`Checking updates for ${name}...`);
        // Check for updates
        try {
            const { stdout } = await execAsync(`npm view ${name} version`);
            const latestVersion = stdout.trim();
            const currentVersion = version.replace(/[\^~]/g, '');

            if (latestVersion !== currentVersion) {
                const [currentMajor] = currentVersion.split('.');
                const [latestMajor] = latestVersion.split('.');
                
                if (currentMajor === latestMajor) {
                    dep.setAvailableUpdates(latestVersion, null);
                } else {
                    dep.setAvailableUpdates(null, latestVersion);
                }
            }
        } catch (error) {
            console.error(`Failed to check updates for ${name}:`, error);
        }

        progress.updateProgress(`Checking security for ${name}...`);
        // Security check with modified approach
        const vulnerabilities = await analyzeSecurity(name);
        vulnerabilities.forEach(vuln => dep.addVulnerability(vuln));

        progress.updateProgress(`Getting license info for ${name}...`);
        // Get license information
        try {
            const { stdout } = await execAsync(`npm view ${name} license repository.url`);
            const lines = stdout.trim().split('\n');
            
            lines.forEach(line => {
                if (!dep.license && line && !line.includes('repository')) {
                    dep.license = line.trim();
                }
                
                if (!dep.repositoryUrl && line.includes('http')) {
                    dep.repositoryUrl = line.trim()
                        .replace('git+', '')
                        .replace('.git', '');
                }
            });
        } catch (error) {
            console.error(`Failed to analyze license for ${name}:`, error);
        }

        deps.push(dep);
        progress.increment(`Completed analysis of ${name}`);
    }

    return deps;
}

async function generateReport(packageJsonPath, onProgress) {
    const progress = new ProgressReport(onProgress);
    const { dependencies, devDependencies } = await analyzePackageJson(packageJsonPath);
    
    progress.updateProgress('Analyzing production dependencies...');
    const prodDeps = await analyzeDependencies(dependencies, 'production', progress);
    
    progress.updateProgress('Analyzing development dependencies...');
    const devDeps = await analyzeDependencies(devDependencies, 'development', progress);

    return {
        production: prodDeps,
        development: devDeps
    };
}

export default {
    execute: async (cmd, onProgress) => {
        try {
            const packageJsonPath = resolve(cwd(), 'package.json');
            const report = await generateReport(packageJsonPath, onProgress);
            
            const result = {
                success: true,
                data: {
                    production: report.production.map(dep => dep.toDisplayObject()),
                    development: report.development.map(dep => dep.toDisplayObject())
                },
                summary: {
                    total: report.production.length + report.development.length,
                    unused: report.production.filter(d => !d.isUsed).length + 
                           report.development.filter(d => !d.isUsed).length,
                    outdated: report.production.filter(d => d.hasUpdates()).length +
                             report.development.filter(d => d.hasUpdates()).length,
                    vulnerable: report.production.filter(d => d.getSecurityRisk() !== 'none').length +
                               report.development.filter(d => d.getSecurityRisk() !== 'none').length
                }
            };

            // If running from CLI, print the report
            if (!onProgress) {
                console.log('\n📦 Dependency Analysis Report\n');
                console.log('Production Dependencies:');
                console.table(result.data.production);
                console.log('\nDevelopment Dependencies:');
                console.table(result.data.development);
            }

            return result;
        } catch (error) {
            return {
                success: false,
                error: error.message,
                details: error.stack
            };
        }
    },
    undo: async () => {
        return { success: true };
    },
}; 