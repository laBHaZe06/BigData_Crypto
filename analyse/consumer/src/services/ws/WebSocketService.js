const WebSocket = require('ws');
const uuid = require('uuid');

class WebSocketService {
    constructor() {
        this.clients = new Map(); // Utiliser Map pour stocker les clients par symbole
    }
    startServer(server) {
        this.wss = new WebSocket.Server({ server: server });

        this.wss.on('connection', (ws, req) => {
            const params = new URLSearchParams(req.url.split('?')[1]);
            const symbol = params.get('symbol');
            const clientId = uuid.v4();
            ws.clientId = clientId;
            ws.symbol = symbol;

            console.log(`Client ${clientId} connected for symbol: ${symbol}`);
            this.subscribeToSymbol(ws, symbol);

            // Envoyer les données initiales au client
            this.sendInitialDataToClient(ws, symbol);

            ws.on('message', (msg) => {
                console.log(`Received message from client ${clientId}:`, msg);

                // Convertir le Buffer en chaîne de caractères si nécessaire
                const message = msg.toString('utf-8');
                console.log(`Message content: ${message}`);
                if(message === ws.symbol) {
                    ws.send(`You are already subscribed to ${ws.symbol}`)
                    //Send price from broadcast service to client
                    let price = this.latestPrices;
                    this.sendPriceToClient(ws, symbol, price);
                }
            });

            ws.on('close', () => {
                console.log(`Client ${clientId} disconnected for symbol: ${symbol}`);
                this.clients.get(symbol).delete(ws);
            });

            ws.on('error', (error) => {
                console.error(`WebSocket error for client ${clientId}:`, error);
            });
        });
    }

    sendInitialDataToClient(ws, symbol) {
        // Assurez-vous que les données sont disponibles avant de les envoyer
        if (this.latestPrices && this.latestPrices.has(symbol)) {
            const price = this.latestPrices.get(symbol);
            console.log(`Price available for symbol ${symbol}: ${price}`);
            this.sendPriceToClient(ws, symbol, price);
        } else {
            console.log(`No initial data available for symbol: ${symbol}`);
        }
    }

    updatePrice(symbol, price) {
        this.latestPrices.set(symbol, price);
        this.broadcast(symbol, price);
    }

    sendPriceToClient(ws, symbol, price) {
        const dataBySymbol = {
            symbol: symbol,
            price: JSON.stringify(price),
            timestamp: Date.now()
        };

        const message = JSON.stringify(dataBySymbol);

        try {
            console.log(`Sending initial price to client ${ws.clientId}`);
            ws.send(message);
        } catch (error) {
            console.error(`Error sending initial price to client ${ws.clientId}:`, error);
        }
    }

    subscribeToSymbol(ws, symbol) {
        if (!this.clients.has(symbol)) {
            this.clients.set(symbol, new Set());
        }
        this.clients.get(symbol).add(ws);
    }

   

    broadcast(symbol, price) {
        console.log(`Broadcasting price for symbol ${symbol}: ${price}`);
        const dataBySymbol = {
            symbol: symbol,
            price: price, // Assurez-vous que le prix est une chaîne
            timestamp: Date.now()
        };

        const message = JSON.stringify(dataBySymbol);
        console.log(`Clients ${this.clients.get(symbol)}`)
    }
}

module.exports = WebSocketService;