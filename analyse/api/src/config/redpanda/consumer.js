const { Kafka } = require('kafkajs');
const { saveNewsToMongo, savePriceToMongo } = require('../db');
const { analyseSentiment } = require('../../utils/analyseSentiment');

const GROUP_ID = 'crypto-group';

const kafka = new Kafka({
    clientId: 'crypto-consumer',
    brokers: ['redpanda:9092'],
});

const consumer = kafka.consumer({ groupId: GROUP_ID });
const cache = {};
let intervalId;
const startConsumer = async (webSocketService) => {
    try {
        await consumer.connect();

        await consumer.subscribe({ topic: /crypto-*/i, fromBeginning: true });

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    const key = message.key ? message.key.toString() : null;
                    const value = message.value ? message.value.toString() : null;
                    console.log("Message reçu:", key, "->", value);

                    // Vérifier d'abord dans le cache en mémoire
                    if (cache[key]) {
                        console.log(`Récupération des données ${key} depuis le cache en mémoire.`);
                        webSocketService.sendToWebSocketClients(key, cache[key].value);
                    } else {
                        console.log(`Données ${key} non trouvées dans le cache. Traitement en cours...`);
                        webSocketService.sendToWebSocketClients(key, value);

                        // Ajouter dans le cache en mémoire
                        cache[key] = { key, value };
                    }

                    // Envoyer les données au service WebSocket
                    const data = { topic, key, value };
                    addToQueue(data, webSocketService);
                } catch (error) {
                    console.error(`Erreur lors du traitement du message de ${topic}: ${error.message}`);
                }
            },
        });

    } catch (error) {
        console.error(`Erreur lors du démarrage du consommateur Kafka: ${error}`);
    }
};
    
function addToQueue(data, webSocketService) {
    const { key, value } = data;

    if (!cache[key]) {
        cache[key] = { value, lastUpdated: Date.now() };
    } else {
        cache[key] = { value, lastUpdated: Date.now() };
    }

    // Démarrer l'intervalle uniquement s'il n'est pas déjà en cours
    if (!intervalId) {
        intervalId = setInterval(() => processQueue(webSocketService), 1000);
    }
}

async function processQueue(webSocketService) {
    const currentTime = Date.now();

    for (let i = cache.length - 1; i >= 0; i--) {
        const item = cache[i];
        if (currentTime - item.lastUpdated > 5000) {
            console.log(`Traitement du message depuis le cache pour le symbole: ${item.key}`);

            try {
                switch (item.topic) {
                    case 'crypto-news':
                        await processAndSaveData(item, webSocketService);
                        break;
                    case 'crypto-price':
                        await processAndSavePrice(item, webSocketService);
                        break;
                    case 'crypto-infos':
                        await processAndSaveInfos(item, webSocketService);
                        break;
                    default:
                        console.log(`Topic ${item.topic} non reconnu`);
                }
                cache.splice(i, 1); // Supprimer les données du cache après traitement
            } catch (error) {
                console.error(`Erreur lors du traitement du message ${item.topic}: ${error.message}`);
            }
        }
    }

    // Arrêter l'intervalle s'il n'y a plus de données en cache
    if (cache.length === 0) {
        clearInterval(intervalId);
        intervalId = null;
    }

}

async function processAndSaveData(data, webSocketService) {
    const sentimentScore = analyseSentiment(data.value);
    const { averageScores, itemCounts } = await calculateAverageScores(sentimentScore, itemCounts);

    console.log('Data to save:', data);
    console.log('Sentiment score:', sentimentScore);
    console.log('Items to calculate:', itemCounts);
    console.log('Average scores:', averageScores);

    data.sentimentScore = averageScores;

        // webSocketService.sendToWebSocketClients({
        //     symbol: JSON.stringify(data.key),
        //     data: JSON.stringify(data.value),
        // });

    console.log('Message sent to WebSocket clients');
    webSocketService.broadcastMessage({ symbol: JSON.stringify(data.key), data: JSON.stringify(data.sentimentScore) });
    await saveNewsToMongo(data.topic, data.key, data.value, averageScores);
}

async function processAndSavePrice(data, webSocketService) {
    if (!data || !data.value) {
        console.log('❌ No data received or data is undefined ❌');
        return;
    }

    const symbol = data.key;
    const value = data.value;

    console.log('Processing price data...');
    console.log('Raw data:', data);
    console.log('Symbol:', symbol);
    console.log('Value:', value);

    if (!symbol || !value || Object.keys(value).length === 0) {
        console.log(`❌ Symbol or value is undefined or empty. Symbol: ${symbol}, Value: ${JSON.stringify(value)} ❌`);
        return;
    }

    console.log(`🚀 Message sent to WebSocket for ${symbol}: ${JSON.stringify(value)} 🚀`);
    // webSocketService.sendToWebSocketClients({ symbol: symbol, data: value });
    // webSocketService.broadcast({ symbol: symbol, data: value });
    console.log(`🚀 Message processed and saved for ${symbol} 🚀`);
    await savePriceToMongo(data.topic, symbol, value);
}

const logProcessedMessage = (topic, partition, parsedData, webSocketService) => {
    const logData = {
        message: parsedData,
        topic,
        partition,
        value: Array.isArray(parsedData) ? parsedData.map(item => ({ value: item })) : { value: parsedData },
    };
    console.log('Message logged');
    // webSocketService.sendToWebSocketClients({ symbol: logData.key, data: logData.key });
    // webSocketService.broadcast({ symbol: logData.key, data: logData.key });
};

const disconnectConsumer = async () => {
    await consumer.disconnect();
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
};

module.exports = {
    startConsumer,
    disconnectConsumer,
};