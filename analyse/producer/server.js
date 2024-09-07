const cluster = require("cluster");
const express = require('express');
const http = require('http'); // Module HTTP de Node.js pour Express
const app = express();
const cors = require('cors');
const os = require("os");
require('dotenv').config();
const { scheduleJob } = require('node-schedule');
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

const { getRealTimePriceBinance} = require('./src/controller/RealTimeController');

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



    app.listen(port, () => {
        console.log(`Producer service running on port ${port}`);
        const symbol = ["bitcoin", "ethereum", "cardano"]
        //for each symbol we pass symbol to parameter

        scheduleJob('*/10 * * * * *', () => {
            symbol.forEach((symbol) => {
                // getRealTimePriceGecko(symbol);
                getRealTimePriceBinance(symbol);
            });
        });
    });

    process.on('SIGINT', () => {
        disconnectConsumer();
        scheduleJob.gracefulShutdown();
        process.exit(0);
    });
}