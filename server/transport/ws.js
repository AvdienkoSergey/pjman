import { WebSocketServer } from 'ws';
import { executePlugin, listAvailablePlugins, handleUndo, handleDelete } from "../../utils/cli.js";

class WsTransport {
    constructor(commander, progress, port, console) {
        this.ws = new WebSocketServer({ port });
        this.console = console;
        this.commander = commander;
        this.progress = progress;
    }

    start() {
        this.ws.on('connection', (connection, req) => {
            const ip = req.socket.remoteAddress;
            
            connection.on('message', async (message) => {
                try {
                    const { type, payload } = JSON.parse(message);
                    await this.handleCommand(connection, type, payload, ip);
                } catch (error) {
                    this.sendError(connection, error);
                }
            });
        });
        
        console.log(`WebSocket server started on port ${this.ws.options.port}`);
    }

    async handleCommand(connection, type, payload, ip) {
        try {
            let result;

            this.progress.on('plugin:start', (data) => {
                this.sendProgress(connection, data);
            });
            
            // Настраиваем отслеживание прогресса
            this.progress.on('plugin:progress', (data) => {
                this.sendProgress(connection, data);
            });

            this.progress.on('plugin:complete', (data) => {
                this.sendProgress(connection, data);
            });

            switch (type) {
                case 'EXECUTE_PLUGIN': {
                    const { name, target } = payload;
                    console.log(`${ip} executing plugin: ${name}${target ? ` with target: ${target}` : ''}`);
                    result = await executePlugin(this.commander, name, target);
                    break;
                }
                case 'LIST_PLUGINS': {
                    console.log(`${ip} requesting plugin list`);
                    result = this.commander.operations
                    break;
                }
                case 'UNDO_COMMAND': {
                    const { commandId } = payload;
                    console.log(`${ip} undoing command: ${commandId}`);
                    result = await handleUndo(this.commander, commandId);
                    break;
                }
                case 'DELETE_COMMAND': {
                    const { commandId } = payload;
                    console.log(`${ip} deleting command: ${commandId}`);
                    result = await handleDelete(this.commander, commandId);
                    break;
                }
                default:
                    throw new Error(`Unknown command type: ${type}`);
            }

            this.sendResult(connection, result);
        } catch (error) {
            this.sendError(connection, error);
        }
    }

    sendProgress(connection, progress) {
        connection.send(JSON.stringify({
            type: 'PROGRESS',
            payload: progress
        }));
    }

    sendResult(connection, result) {
        connection.send(JSON.stringify({
            type: 'RESULT',
            payload: result
        }));
    }

    sendError(connection, error) {
        connection.send(JSON.stringify({
            type: 'ERROR',
            payload: {
                message: error.message,
                stack: error.stack
            }
        }));
    }
}

export default WsTransport;