class ProgressReport {
    constructor(onProgress) {
        this.onProgress = onProgress || (() => {});
        this.total = 0;
        this.current = 0;
    }

    setTotal(total) {
        this.total = total;
        this.updateProgress('Initializing command...');
    }

    increment(message) {
        this.current++;
        this.updateProgress(message);
    }

    updateProgress(message) {
        const percentage = (this.current / this.total) * 100;
        this.onProgress({
            percentage: Math.round(percentage),
            message,
            current: this.current,
            total: this.total
        });
    }
}

export default ProgressReport;