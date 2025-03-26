class PjmanClient {
    constructor(url = 'ws://localhost:4001') {
        this.socket = new WebSocket(url);
        this.listeners = new Map();
        this.setupSocket();
    }

    setupSocket() {
        this.socket.onmessage = (event) => {
            const { type, payload } = JSON.parse(event.data);
            
            switch (type) {
                case 'PROGRESS':
                    this.emit('progress', payload);
                    break;
                case 'RESULT':
                    this.emit('result', payload);
                    break;
                case 'ERROR':
                    this.emit('error', payload);
                    break;
            }
        };

        this.socket.onopen = () => this.emit('connected');
        this.socket.onclose = () => this.emit('disconnected');
        this.socket.onerror = (error) => this.emit('error', error);
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
    }

    off(event, callback) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.delete(callback);
        }
    }

    emit(event, data) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(callback => callback(data));
        }
    }

    send(type, payload) {
        return new Promise((resolve, reject) => {
            const onResult = (result) => {
                this.off('result', onResult);
                this.off('error', onError);
                resolve(result);
            };

            const onError = (error) => {
                this.off('result', onResult);
                this.off('error', onError);
                reject(error);
            };

            this.on('result', onResult);
            this.on('error', onError);

            this.socket.send(JSON.stringify({ type, payload }));
        });
    }

    // API методы
    async executePlugin(name, target) {
        return this.send('EXECUTE_PLUGIN', { name, target });
    }

    async listPlugins() {
        return this.send('LIST_PLUGINS');
    }

    async undoCommand(commandId) {
        return this.send('UNDO_COMMAND', { commandId });
    }

    async deleteCommand(commandId) {
        return this.send('DELETE_COMMAND', { commandId });
    }
}

const client = new PjmanClient();

window.client = client;

client.on('progress', (progress) => {
    console.log(`Progress: ${progress.percentage}% - ${progress.message}`);
});

client.on('connected', async () => {
    try {
        console.log('Connected to server');
    } catch (error) {
        console.error('Error:', error);
    }
});

client.on('error', (error) => {
    console.error('WebSocket error:', error);
});

const getPlugins = async () => {
    const plugins = await client.listPlugins();
    console.log('Available plugins:', plugins);
};

const executePlugin = async (name, target) => {
    return await client.executePlugin(name, target);
};

export { getPlugins, executePlugin };