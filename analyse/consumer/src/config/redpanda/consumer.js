const { Kafka } = require('kafkajs');
const { saveNewsToMongo, savePriceToMongo } = require('../db');
const { analyseSentiment } = require('../../utils/analyseSentiment');

const GROUP_ID = 'crypto-group';

const kafka = new Kafka({
    clientId: 'crypto-consumer',
    brokers: ['redpanda:9092'],
});

const consumer = kafka.consumer({ groupId: GROUP_ID });
var cache = [];
let intervalId;

const startConsumerMongo = async () => {
   
    try {
        await consumer.connect();
        await consumer.subscribe({ topic: /crypto-*/i, fromBeginning: true });

        await consumer.run({
            eachMessage: async ({ topic, message }) => {
                try {
                    const symbol = message.key ? message.key.toString() : null;
                    const value = message.value ? message.value.toString() : null;

                    if (!value || !symbol) {
                        console.error('Invalid message format', { topic, message });
                        return;
                    }

                    console.log(`Message received: ${topic}, ${symbol}, ${value}`);
                    cache.push({ topic, symbol, value});
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
        console.error(`Error starting Kafka consumer: ${error}`);
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
            console.log('Cache , vider, traitement des données...');

            for (const item of cacheCopy) {
                console.log(`Topic ${item.topic} \n Symbol ${item.symbol} \n Data ${item.value}`);
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
            console.log('Cache n`est pas remplis, en attente ...\n');
            console.log(`Cache size: ${cache.length}\n `);
            console.log(`En attente : ${1000 - (Date.now() % 1000)} ms...\n`);

            // Si l'intervalle n'est pas déjà défini, définir un nouvel intervalle
            if (!intervalId) {
                intervalId = setInterval(addToQueue, 1000);
            }
        }
    } catch (error) {
        console.error(`Erreur lors du traitement du cache: ${error.message}`);
    }
}          
                
async function processAndSaveData(data) {
    const sentimentScore = analyseSentiment(data.value);
    const { averageScores, itemCounts } = await calculateAverageScores(sentimentScore, itemCounts);

    console.log('Data to save:', data);
    console.log('Sentiment score:', sentimentScore);
    console.log('Items to calculate:', itemCounts);
    console.log('Average scores:', averageScores);

    data.sentimentScore = averageScores;
    
    await saveNewsToMongo(data.topic, data.key, data.value, averageScores);
}

async function processAndSavePrice(data) {
    // console.log("Loading data : " + data.value);
    try {
    const dataPrice = JSON.parse(data.value); // Analyse de data.value
    if(dataPrice.symbol === undefined || dataPrice.symbol === null){
        console.log("Symbol undefined");
        return;
    }

        const symbol = dataPrice.symbol;
        const price = dataPrice.price;
       
        
        console.log('Processing price data.to Mongo...\n');
        console.log("-------------------------\n");
        console.log('Raw data:', dataPrice);
        console.log("-------------------------\n");
        console.log('Symbol:', symbol);
        console.log("-------------------------\n");
        console.log('Value prix:', price);
        console.log("-------------------------\n");
        
        await savePriceToMongo(data.topic, symbol, price);
        console.log(`🚀 Message processed and saved for ${symbol} 🚀`);
        
    } catch (err) {
        console.error(`❌❌❌ Error processing data: ${err} ❌❌❌`);
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
    startConsumerMongo,
    disconnectConsumer,
};