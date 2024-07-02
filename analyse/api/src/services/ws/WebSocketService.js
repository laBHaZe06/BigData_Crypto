const WebSocket = require('ws');
const EventEmitter = require('events');
const { v4: uuid } = require('uuid'); // Utilisation de uuid v4

class WebSocketService extends EventEmitter {
    constructor() {
        super();
        this.clients = new Map(); // Utilisation de Map pour une gestion efficace des clients
    }

    startServer(server) {
        this.wss = new WebSocket.Server({ server });
    
        this.wss.on('connection', (ws, req) => {
          // Gérer la connexion WebSocket ici
          console.log('WebSocket client connected');
    
          // Récupérer le symbole depuis l'URL (par exemple, /?symbol=bitcoin)
          const urlParams = new URLSearchParams(req.url.split('?')[1]);
          const symbol = urlParams.get('symbol');
          console.log(`WebSocket connection for symbol: ${symbol}`);
    
          // Ajouter le client WebSocket à la liste des clients par symbole
          if (!this.clients.has(symbol)) {
            this.clients.set(symbol, []);
          }
          this.clients.get(symbol).push(ws);
    
          // Écouter les messages entrants
          ws.on('message', (message) => {
            console.log(`Received message from client: ${message}`);
            // Traiter les messages reçus si nécessaire
          });
    
          // Gérer la fermeture de la connexion
          ws.on('close', () => {
            console.log('WebSocket client disconnected');
            // Supprimer le client WebSocket de la liste des clients par symbole
            const symbolClients = this.clients.get(symbol);
            if (symbolClients) {
              const index = symbolClients.indexOf(ws);
              if (index !== -1) {
                symbolClients.splice(index, 1);
                console.log(`WebSocket client removed for symbol: ${symbol}`);
              }
              if (symbolClients.length === 0) {
                this.clients.delete(symbol);
              }
            }
          });
    
          // Gérer les erreurs de connexion WebSocket
          ws.on('error', (err) => {
            console.error('WebSocket error:', err);
          });
        });
    
        // Simuler l'envoi de prix en temps réel (à remplacer par la logique de récupération des prix réels)
        setInterval(() => {
          // Exemple : Envoie de prix pour Bitcoin
          const bitcoinPrice = Math.random() * 100000;
          this.sendToWebSocketClients('bitcoin', { price: bitcoinPrice });
        }, 3000); // Envoyer toutes les 3 secondes pour l'exemple
      }
    
      // Méthode pour envoyer un message à tous les clients WebSocket d'un symbole donné
      sendToWebSocketClients(symbol, data) {
        if (this.clients.has(symbol)) {
          const symbolClients = this.clients.get(symbol);
          symbolClients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(data));
              console.log(`Sent message to WebSocket client for symbol ${symbol}:`, data);
            }
          });
        }
      }
    
    
    broadcast(symbol, data) {
        this.clients.forEach(({ ws, symbols }) => {
            if (symbols.has(symbol) && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(data));
            }
        });
    }
}

module.exports = WebSocketService;