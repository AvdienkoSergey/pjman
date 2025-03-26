import StaticServer from './static.js';
import WsTransport from './transport/ws.js';
import { Commander } from '../core/Commander.js';
import operations from '../core/operations/index.js';
import { progressReport } from '../core/ProgressReport.js';
import { configFile } from '../utils/paths.js';
import fs from 'node:fs';

const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
const STATIC_PORT = config.ports.static || 4000;
const WS_PORT = config.ports.ws || 4001;

const staticServer = new StaticServer('public', STATIC_PORT, console);
const wsServer = new WsTransport(
    new Commander(operations), 
    progressReport, 
    WS_PORT, 
    console
);

export { staticServer, wsServer };