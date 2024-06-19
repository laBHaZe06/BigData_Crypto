const WebSocket = require('ws');
const EventEmitter = require('events');

class WebSocketService extends EventEmitter {
    constructor() {
        super();
        this.clients = [];
        this.server = new WebSocket.Server({ noServer: true });

        this.server.on('connection', (client) => {
            this.handleConnection(client);
        });
    }

    handleConnection(client) {
        this.addWebSocketClient(client);
        
        client.on('close', () => {
            this.removeWebSocketClient(client);
        });

        this.emit('clientConnected', client);
    }

    sendToWebSocketClients(data) {
        this.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    }

    addWebSocketClient(client) {
        this.clients.push(client);
        this.emit('clientAdded', client);
    }

    removeWebSocketClient(client) {
        const index = this.clients.indexOf(client);
        if (index !== -1) {
            this.clients.splice(index, 1);
            this.emit('clientRemoved', client);
        }
    }

    attachToServer(httpServer) {
        httpServer.on('upgrade', (request, socket, head) => {
            this.handleUpgrade(request, socket, head);
        });
    }

    handleUpgrade(request, socket, head) {
        this.server.handleUpgrade(request, socket, head, (client) => {
            this.handleConnection(client);
        });
    }
}

module.exports = WebSocketService;