import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class StaticServer {
    static MIME_TYPES = {
        html: 'text/html; charset=UTF-8',
        json: 'application/json; charset=UTF-8',
        js: 'application/javascript; charset=UTF-8',
        css: 'text/css',
        png: 'image/png',
        ico: 'image/x-icon',
        svg: 'image/svg+xml',
    };

    static HEADERS = {
        'X-XSS-Protection': '1; mode=block',
        'X-Content-Type-Options': 'nosniff',
        'Strict-Transport-Security': 'max-age=31536000; includeSubdomains; preload',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    constructor(root, port, console) {
        this.root = root;
        this.port = port;
        this.console = console;
        this.server = null;
    }

    async handleRequest(req, res) {
        const url = req.url === '/' ? '/index.html' : req.url;
        const filePath = path.join(this.root, url);

        console.log({start: filePath.startsWith(path.basename(this.root))});

        if (!filePath.startsWith(path.basename(this.root))) {
            res.statusCode = 404;
            return void res.end('"File is not found"');
        }

        try {
            const data = await fs.promises.readFile(path.join(__dirname, filePath));
            const fileExt = path.extname(filePath).substring(1);
            const mimeType = StaticServer.MIME_TYPES[fileExt] || StaticServer.MIME_TYPES.html;
            
            res.writeHead(200, { 
                ...StaticServer.HEADERS, 
                'Content-Type': mimeType 
            });
            res.end(data);
        } catch (err) {
            res.statusCode = 404;
            res.end('"File is not found"');
        }
    }

    start() {
        this.server = http.createServer(async (req, res) => {
            await this.handleRequest(req, res);
        });

        this.server.listen(this.port);
        this.console.log(`Static server started on port ${this.port}`);
        
        return this.server;
    }

    stop() {
        if (this.server) {
            this.server.close();
            this.console.log(`Static server on port ${this.port} stopped`);
        }
    }
}

export default StaticServer;