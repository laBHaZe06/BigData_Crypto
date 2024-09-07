const cluster = require("cluster");
const express = require('express');
const app = express();
const cors = require('cors');
const os = require("os");
const {startConsumerWhareHouse ,disconnectConsumer} = require('./src/config/consumer.js');
const { connectWhareHouse } = require('./src/config/clickhouse.js');
require('dotenv').config();
const port = process.env.PORT || 5005; // Ajout d'une valeur par défaut pour le port
const http = require('http');

const server = http.createServer(app); // Créez un serveur HTTP avec Express

const { scheduleJob } = require('node-schedule');

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
  startConsumerWhareHouse();

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
  
  // Gestion de la terminaison du processus
  process.on('SIGINT', () => {
    disconnectConsumer();
    process.exit(0);
  });
}
