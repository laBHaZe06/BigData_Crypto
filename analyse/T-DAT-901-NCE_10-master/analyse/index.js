const cluster = require("cluster");
const express = require('express');
const app = express();
const cors = require('cors');
const os = require("os");
const { startConsumer, disconnectConsumer } = require('./src/config/redpanda/consumer.js');
require('dotenv').config();

const port = process.env.PORT || 5010;

console.log(`The total number of CPUs is ${os.cpus().length}`);
console.log(`Primary pid=${process.pid}`);

// Configuration commune
app.use(cors());
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

    cluster.worker.on('listening', (address) => {
        console.log(`Worker ${process.pid} is now connected to ${address.address}:${address.port}`);
    });

    cluster.worker.on('message', (message) => {
        if (message.type === 'apiResponse') {
            // Traitement de la réponse de la requête API dans le worker
            console.log(`Worker ${process.pid} received API response: ${message.data}`);
        }
    });
    startConsumer();



    process.on('SIGINT', () => {
        disconnectConsumer();
        process.exit(0);
    });
}