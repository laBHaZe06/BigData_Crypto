const { Kafka } = require('kafkajs');
const { pushPriceBySymbol } = require('./clickhouse');

const GROUP_ID = 'crypto-group';

const kafka = new Kafka({
    clientId: 'crypto-consumer',
    brokers: ['redpanda:9092'],
});

const consumer = kafka.consumer({ groupId: GROUP_ID });
var cache = [];
let intervalId;

const startConsumerWhareHouse = async () => {
    try {
        await consumer.connect();

        console.log('✅✅✅  Consumer to wharehouse started. ✅✅✅ ');
        await consumer.subscribe({ topic: /crypto-*/i, fromBeginning: true });

        await consumer.run({
            eachMessage: async ({ topic, message }) => {
                try {
                    // console.log("Message received:", message.key.toString(), message.value.toString());
                    
                    const symbol = message.key ? message.key.toString() : null;
                    const messageValue= message.value ? message.value.toString() : null;

                    const parsedValue = JSON.parse(messageValue);

                    const price = parsedValue.price;
                    

                    if (!symbol || !price) {
                        console.error('Invalid message format', { topic, message });
                        return;
                    }

                    if (!price) {
                        console.error('Price not found in message', { topic, message });
                        return;
                    }

                    console.log(`✅✅✅  Message received: ${topic}, ${symbol}, ${price} ✅✅✅  `);

                    // console.log("Data received : " , topic,  symbol, price);
                    cache.push({ topic, symbol, price});
                    await addToQueue();

                } catch (error) {
                    console.error(`Error processing Kafka message: ${error}`);
                }
            }
        });
        consumer.on('consumer.rebalancing', () => {
            console.log('Rebalancing in progress...');
        });

        consumer.on('error', (error) => {
            console.error(`Consumer error: ${error}`);
        });
        
    } catch (error) {
        console.error(` 💥💥💥 Error starting Kafka consumer: ${error} 💥💥💥 `);
    }
};


async function addToQueue() {
    try {
        if (cache.length === 0) {
            clearInterval(intervalId);
            intervalId = null;
            console.log('Cache est encore vide, attente de données...');
            return;
        }

        console.log(`Le cache contient ${cache.length} éléments`);

        if (cache.length >= 200) {
            console.log(`Traitement du cache avec ${cache.length} éléments`);

            // Copie profonde du cache pour traitement
            const cacheCopy = [...cache];
            cache = []; // Vider le cache principal
            console.log('Cache vidé, traitement des données...');

            for (const item of cacheCopy) {
                // console.log(`Topic ${item.topic} \n Symbol ${item.symbol} \n Data ${item.price[1]} \n `);

                switch (item.topic) {
                    case 'crypto-news':
                        await processAndSaveData(item);
                        break;
                    case 'crypto-price':
                        await processAndSavePrice(item);
                        break;
                    case 'crypto-infos':
                        await processAndSaveInfos(item);
                        break;
                    default:
                        console.log(`Topic ${item.topic} non reconnu`);
                }
            }

        } else {
            console.log('Cache non rempli, en attente...');
            console.log(`Taille du cache: ${cache.length}`);
            console.log(`En attente : ${1000 - (Date.now() % 1000)} ms...`);
            if (!intervalId) {
                intervalId = setInterval(addToQueue, 1000);
            }
        }
    } catch (error) {
        console.error(`Erreur lors du traitement du cache: ${error.message}`);
    }
}    
                
// async function processAndSaveData(data) {
//     const sentimentScore = analyseSentiment(data.value);
//     const { averageScores, itemCounts } = await calculateAverageScores(sentimentScore, itemCounts);

//     console.log('Data to save:', data);
//     console.log('Sentiment score:', sentimentScore);
//     console.log('Items to calculate:', itemCounts);
//     console.log('Average scores:', averageScores);

//     data.sentimentScore = averageScores;
    
//     await saveNewsToMongo(data.topic, data.key, data.value, averageScores);
// }

async function processAndSavePrice(data) {
   
    try {
        // Validation des données
        if (data.symbol === null  || data.price === null) {
            console.error("Symbol ou price est manquant", data);
            return;
        }

        const symbol = data.symbol;
        const price = parseFloat(data.price);
        console.log('Recu : ' + symbol, price);
        const currentTimestamp = new Date(); // Utilisez une nouvelle variable pour la date actuelle
        const formattedTimestamp = currentTimestamp.toISOString().replace('T', ' ').slice(0, 19);

        // // Vérifiez si le price est bien un nombre
        if (isNaN(price)) {
            console.error(`Price invalide: ${data.price}`);
            return;
        }


        console.log('Processing price data to ClickHouse...');
        console.log("-------------------------");
        console.log('Raw data:' + data.value);
        console.log("-------------------------");
        console.log('Symbol:'+ symbol);
        console.log("-------------------------");
        console.log('Value prix:' + price);
        console.log("-------------------------");
        console.log('Timestamp:' + formattedTimestamp);
        console.log("-------------------------");
        

        await pushPriceBySymbol(symbol, price , formattedTimestamp);

        console.log(`🚀 Message processed and saved for ${symbol} 🚀`);

    } catch (err) {
        console.error(`❌❌❌ Error processing data: ${err.message} ❌❌❌`);
    }
}

const disconnectConsumer = async () => {
    await consumer.disconnect();
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
};

module.exports = {
    startConsumerWhareHouse,
    disconnectConsumer,
};