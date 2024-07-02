const cluster = require("cluster");
const express = require('express');
const app = express();
const cors = require('cors');
const os = require("os");
const WebSocketService = require('./src/services/ws/WebSocketService');
const { startConsumer, disconnectConsumer } = require('./src/config/redpanda/consumer.js');
require('dotenv').config();
const { connectDb } = require('./src/config/db.js');
const port = process.env.PORT || 3000; // Ajout d'une valeur par défaut pour le port
const http = require('http');

const server = http.createServer(app); // Créez un serveur HTTP avec Express
console.log(`The total number of CPUs is ${os.cpus().length}`);
console.log(`Primary pid=${process.pid}`);

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
const webSocketService = new WebSocketService();

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
  connectDb();

  cluster.worker.on('listening', (address) => {
    console.log(`Worker ${process.pid} is now connected to ${address.address}:${address.port}`);
  });

  cluster.worker.on('message', (message) => {
    if (message.type === 'apiResponse') {
      // Traitement de la réponse de la requête API dans le worker
      console.log(`Worker ${process.pid} received API response: ${message.data}`);
    }
  });

  
  server.listen(port, () => {
    console.log(`API websocket worker ${process.pid} listening on port ${port}`);
  });
  
  startConsumer(webSocketService);
  webSocketService.startServer(server);
  // Gestion de la terminaison du processus
  process.on('SIGINT', () => {
    disconnectConsumer();
    process.exit(0);
  });
}