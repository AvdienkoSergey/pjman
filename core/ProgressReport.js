import { EventEmitter } from 'node:events';
import { createConsoleProgressBar } from "../utils/console.js"

class PluginWorkProgress {
    constructor() {
        this.total = 100
        this.current = 0
        this.message = 'Getting started with the plugin'
    }

    setCurrent(num) {
        this.current = num
    }

    getCurrent() {
        return this.current
    }

    getTotal() {
        return this.total
    }

    getMessage() {
        return this.message
    }
    
    setMessage(message) {
        this.message = message
    }

    getPercent() {
        return Math.round((this.current / this.total) * 100)
    }
}

class ProgressReport extends EventEmitter {
    constructor() {
        super();
        this.pluginsWorkProgress = new Map();
    }

    start(plugin = 'default') {
        if (!this.pluginsWorkProgress.has(plugin)) {
            this.pluginsWorkProgress.set(plugin, new PluginWorkProgress());
        }
        this.emit('plugin:start', {
            plugin,
            message: this.pluginsWorkProgress.get(plugin).getMessage(),
            percentage: this.pluginsWorkProgress.get(plugin).getPercent()
        });
    }

    increment(message, addToCurrent = 1, plugin = 'default') {
        const pluginWorkProgress = this.pluginsWorkProgress.get(plugin);
        if (pluginWorkProgress) {
            pluginWorkProgress.setMessage(message);
            pluginWorkProgress.setCurrent(pluginWorkProgress.getCurrent() + addToCurrent);
            
            this.emit('plugin:progress', {
                plugin,
                message: pluginWorkProgress.getMessage(),
                percentage: pluginWorkProgress.getPercent()
            });

            if (pluginWorkProgress.getCurrent() === pluginWorkProgress.getTotal()) {
                this.emit('plugin:complete', {
                    plugin,
                    message: `Completed ${plugin}`,
                    percentage: pluginWorkProgress.getPercent()
                });
            }
        }
    }

    complete(result) {
        this.emit('completed', result);
    }

    error(error) {
        this.emit('error', error);
    }
}

const progressReport = new ProgressReport();

const consoleProgressBar = createConsoleProgressBar()

progressReport.on('plugin:start', consoleProgressBar.update)
progressReport.on('plugin:progress', consoleProgressBar.update);
progressReport.on('plugin:complete', consoleProgressBar.complete);

export {
    progressReport
};