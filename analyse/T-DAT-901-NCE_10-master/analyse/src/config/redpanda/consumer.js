const { Kafka } = require('kafkajs');
const { saveNewsToMongo, savePriceToMongo} = require('../db');
const {analyseSentiment} = require('../../utils/analyseSentiment');
const WebSocketService = require('../../services/ws/WebSocketService');
const webSocketService = new WebSocketService();

const GROUP_ID = 'crypto-group';

const kafka = new Kafka({
    clientId: 'crypto-consumer',
    groupId: GROUP_ID,
    brokers: ['redpanda:9092'],
});

const consumer = kafka.consumer({ groupId: GROUP_ID });
const cache = [];

const startConsumer = async () => {
    try {
        await consumer.connect();
        console.log('✅✅✅ Connected to Kafka Consumer ✅✅✅');
        await consumer.subscribe({ topic: /crypto-*/i, fromBeginning: true });
        console.log('🚀🚀🚀 Subscribed to Redpanda topic 🚀🚀🚀');
        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                console.log(`✅✅✅ Received message from ${topic}: ${message.value.toString()}`);
                logProcessedMessage(topic, partition, message.value.toString());
                addToQueue({
                    topic: topic,
                    key: message.key.toString(),
                    value: message.value.toString(),
                  });
                webSocketService.sendToWebSocketClients({
                    source: 'Kafka',
                    data: {
                        topic: topic,
                        key: message.key.toString(),
                        value: message.value.toString(),
                    },
                });
                console.log('🚀🚀🚀 Message sent 🚀🚀🚀');

            },
            
        });

    } catch (error) {
        console.error(`💥💥💥 Error starting Redpanda consumer: ${error}`);
    }
}
function addToQueue(data) {
    cache.push(data);
    console.log('✅✅✅ Message added to cache ✅✅✅');
    setInterval(() => processQueue(cache), 60000);
  }
  function processQueue() {
    if (cache.length > 0) {
        const data = cache.shift();
        console.log('⌛⌛⌛ Processing message from cache ⌛⌛⌛');
        
        if (data.topic === 'crypto-news') {
            processAndSaveData(data);
        } else if (data.topic === 'crypto-price') {
            processAndSavePrice(data);
        } else if (data.topic === 'crypto-history') {
            processAndSaveHistory(data);
        } else if (data.topic === 'crypto-logs') {
            processAndSaveLogs(data);
        } else {
            console.log('❌❌❌ Topic not found ❌❌❌');
        }

        console.log('✅✅✅ Cache processed ✅✅✅');
    }
}
  async function processAndSaveData(analyseValue, data) {
    try{
        const sentimentScore = analyseSentiment(analyseValue);
        const { averageScores, itemCounts } = await calculateAverageScores(sentimentScore, itemCounts);
    
        console.log('Données à enregistrer :', data);
        console.log('Score de sentiment :', sentimentScore);
        console.log('-------------------------------------------');
        console.log('Nombre d\'éléments a calculer :', itemCounts);
        console.log('Moyenne des scores :', averageScores);
        // Ajoutez le score de sentiment aux données
        data.sentimentScore = averageScores;
        
        // Envoie le message à la socket
        webSocketService.sendToWebSocketClients({
            source: 'Redpanda',
            data: {
                topic: data.topic,
                key: data.key,
                value: data.value,
                sentimentScore: averageScores,
            },
        });
        
        await saveNewsToMongo(data.topic, data.key, data.value, averageScores);

    } catch (error) {
        console.error(error);
    }
}

  async function processAndSavePrice(data) {
    try{
        if(data) {
        // Envoie le message à la socket
        webSocketService.sendToWebSocketClients({
          source: 'Redpanda',
          data: {
            topic: data.topic,
            key: data.key,
            value: data.value,
          },
        });
        await savePriceToMongo(data.topic, data.key, data.value);

    } else {
        console.log('❌❌❌ No data received ❌❌❌');
    }
    } catch (error) {
        console.error(error);
    }
}

async function processAndSaveLogs(data) {
    try{
        // Envoie le message à la socket
        webSocketService.sendToWebSocketClients({
            source: 'Redpanda',
            data: {
                topic: data.topic,
                key: data.key,
                value: data.value,
            },
        });
        console.log('🚀🚀🚀 Message sent 🚀🚀🚀');
        await savePriceToMongo(data);
    } catch (error) {
        console.error(error);
    }
}

const logProcessedMessage = (topic, partition, parsedData) => {
    const logData = {
        message: parsedData, 
        topic: topic,
        partition: (partition) ? partition : 1,
        value: Array.isArray(parsedData) ? parsedData.map(item => ({ value: item })) : { value: parsedData },
    };
    console.log(logData);
};


const disconnectConsumer = async () => {
    await consumer.disconnect();
};


module.exports = {
    startConsumer,
    disconnectConsumer,

};