const cluster = require("cluster");
const express = require('express');
const app = express();
const cors = require('cors');
const os = require("os");
const WebSocketService = require('./src/services/ws/WebSocketService');
const webSocketService = new WebSocketService();
require('dotenv').config();

const port = process.env.PORT || 5001;

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
    
    const { FindNewsCoinJournal, FindNewsCryptoBenzinGa, FindNewsCryptoCoinTelegraph } = require('./src/controller/FluxController');
    const { getRealTimePriceBinance, getRealTimePriceGecko} = require('./src/controller/RealTimeController');
    
    cluster.worker.on('listening', (address) => {
        console.log(`Worker ${process.pid} is now connected to ${address.address}:${address.port}`);
    });

    cluster.worker.on('message', (message) => {
        if (message.type === 'apiResponse') {
            // Traitement de la réponse de la requête API dans le worker
            console.log(`Worker ${process.pid} received API response: ${message.data}`);
        }
    });
    const cryptoSymbols = ['bitcoin', 'ethereum', 'cardano', 'litecoin', 'dogecoin', 'ripple', 'tether', 'tron'];
    const cryptoMethods = [FindNewsCoinJournal, FindNewsCryptoBenzinGa, FindNewsCryptoCoinTelegraph];
    const cryptoPriceMethod = [getRealTimePriceBinance, getRealTimePriceGecko];
    
    async function processCryptoMethod(method) {
        try {
            const results = await Promise.all(cryptoSymbols.map(async (cryptoSymbol) => {
                return method(cryptoSymbol);
            }));
            console.log(`Traitement réussi `);
            return results;
        } catch (error) {
            console.error(`Erreur lors du traitement`, error);
            throw error;
        }
    }
    
    setInterval(async () => {
    
    await Promise.all(cryptoMethods.map(async (method) => {
        try {
            return await processCryptoMethod(method);
        } catch (error) {
            console.error('Erreur lors de l\'appel des méthodes du contrôleur:', error);
        }
            }));
    // 10minutes
    }, 600000); 

    setInterval(async () => {
    await Promise.all(cryptoPriceMethod.map(async (method) => {
        try {
            return await processCryptoMethod(method);
        } catch (error) {
            console.error('Erreur lors de l\'appel des méthodes du contrôleur:', error);
        }
            }));   
    }, 60000 );  // 60 secondes

    app.listen(port, () => {
        console.log(`✅✅✅ Worker ${process.pid} is listening on port ${port} ✅`);
    });

    process.on('SIGINT', () => {
        disconnectConsumer();
        process.exit(0);
    });

}