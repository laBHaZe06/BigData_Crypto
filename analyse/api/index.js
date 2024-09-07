const cluster = require("cluster");
const express = require('express');
const app = express();
const cors = require('cors');
const os = require("os");
require('dotenv').config();
const port = process.env.PORT || 5000; // Ajout d'une valeur par défaut pour le port
const http = require('http');
const { connectWhareHouse } = require("./src/config/clickhouse");
const { v4: uuidv4 } = require('uuid');
const ws = require('ws');
const { priceBySymbol } = require("./src/services/Prices/pricesData");
const server = http.createServer(app); 
const wss = new ws.Server({ server: server });

let clients = new Map();

// Configuration commune
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://localhost:3000',
    'http://127.0.0.1:3000',
    'https://127.0.0.1:3000'
  ],
  credentials: true, // Autoriser les cookies et les en-têtes d'authentification
}));
app.use(express.text({ type: 'text/plain' }));
app.use(express.json({ type: 'application/json' }));
app.use(express.json({ type: 'x-www-form-urlencoded' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));


const numCPUs = os.cpus().length;


if (cluster.isMaster) {
  console.log(`Master process ${process.pid} is running`);
  
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker process ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
  
} else {

  connectWhareHouse();
  
  
  cluster.worker.on('listening', (address) => {
    console.log(`Worker ${process.pid} is now connected to ${address.address}:${address.port}`);
  });
  
  cluster.worker.on('message', (message) => {
    if (message.type === 'apiResponse') {
      // Traitement de la réponse de la requête API dans le worker
      console.log(`Worker ${process.pid} received API response: ${message.data}`);
    }
  });


  wss.on('connection', (connection) => {
    const userId = uuidv4();
    connection.client = userId;
    clients.set(userId, connection);
    console.log("Client connected: " + connection.client);

    connection.on('message', async (message) => {
        console.log(`Raw message received: ${message}`);
        try {
            const messageString = message.toString();
            let parsedMessage;

            try {
                parsedMessage = JSON.parse(messageString);
            } catch (error) {
                console.log('Failed to parse JSON, assuming plain text');
                parsedMessage = { symbol: messageString };
            }

            const action = parsedMessage.action || 'subscribe';
            const symbol = parsedMessage.symbol || parsedMessage;

            if (action === 'subscribe' && symbol) {
                // Envoie le prix initial
                const priceObject = await priceBySymbol(symbol);
                if (priceObject) {
                    connection.send(JSON.stringify({ type: 'price', symbol, price: priceObject }));
                } else {
                    console.log('No price data found for symbol');
                }

                // Supposons que vous mettez à jour les prix régulièrement
                const updateInterval = setInterval(async () => {
                    const updatedPriceObject = await priceBySymbol(symbol);
                    if (updatedPriceObject) {
                        connection.send(JSON.stringify({ type: 'priceUpdate', symbol, price: updatedPriceObject }));
                    }
                }, 8000); // Mise à jour toutes les 10 secondes

                // Nettoyage lors de la déconnexion
                connection.on('close', () => {
                    clearInterval(updateInterval);
                    console.log(`Client ${connection.client} disconnected`);
                    clients.delete(connection.client);
                });

            } else {
                console.log('Invalid action or symbol in the message');
            }
        } catch (error) {
            console.error('Error handling message:', error);
        }
    });

    connection.on('error', (err) => {
        console.error('WebSocket error:', err);
    });
});

//   app.use('/api/:symbol', async (req, res) => {
//     const symbol = req.params.symbol;

//     try {
//         const price = await priceBySymbol(symbol);
//         if (price !== null) {
//             res.status(200).json({ symbol, price });
//         } else {
//             res.status(404).json({ message: `No price data found for symbol ${symbol}` });
//         }
//     } catch (error) {
//         console.error('Error fetching price:', error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });


  
  server.listen(port, () => {
    console.log(`API websocket worker ${process.pid} listening on port ${port}`);
  });

  
  // Gestion de la terminaison du processus
  process.on('SIGINT', () => {
    disconnectConsumer();
    process.exit(0);
  });
}
