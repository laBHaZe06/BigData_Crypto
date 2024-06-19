const { Kafka, CompressionTypes } = require('kafkajs');
const { createTopic } = require('./admin');
const uuid = require('uuid');

const kafka = new Kafka({
    clientId: 'crypto-producer',
    groupId: 'crypto-group',
    brokers: ['redpanda:9092'],
    acks: 1,
    // ssl: true,
    // connectionTimeout: 3000,
});

const producerRealTime = kafka.producer({ createPartitioner: Kafka.DefaultPartitioner }); // Create a producer for real-time data
const producerNews = kafka.producer({ createPartitioner: Kafka.DefaultPartitioner }); // Create a producer for news 
const producerLogs = kafka.producer({ createPartitioner: Kafka.DefaultPartitioner }); // Create a producer for logs data.
const id = uuid.v4();

const connectProducer = async (producer) => {
    try {
        await producer.connect();
        console.log('✅✅✅ Connected to Redpanda ✅✅✅');
    } catch (e) {
        console.error('💥💥💥 Error while connecting to Redpanda 💥💥💥');
        console.error(e);
    }
};

const sendCryptoDataToKafka = async (producer, topic, key, value) => {

    try {
        await connectProducer(producer);
        await createTopic(topic);

        if (value !== undefined && value !== null) {
            console.log('✅✅✅ Data received ✅✅✅');
            const result = await producer.send({
                topic: topic,
                partitions: 1,
                messages: [
                    {
                        key: key.toString(),
                        value: JSON.stringify(value),
                    },
                ],
            });
            console.log(`✅✅✅ Produced message to ${topic}: `, result);
            console.log('🚀🚀🚀 Data sent to Redpanda 🚀🚀🚀');
        } else {
            console.log('❌❌❌ No data received ❌❌❌');
        }
    } catch (e) {
        console.log('💥💥💥 Error while sending data to Redpanda 💥💥💥');
        console.error(e);
    }
};


//function pour envoyer des logs à kafka 
const sendLogsProgramToKafka = async (producer, topic, key, value) => {
    try {
        await connectProducer(producer);
        await createTopic(topic);

        if (value !== undefined && value !== null) {
            console.log('✅✅✅ Data received ✅✅✅');
            const result = await producer.send({
                topic: topic,
                partitions: 1,
                messages: [
                    {
                        key: key.toString(),
                        value: JSON.stringify(value),
                    },
                ],
            });
            console.log(`✅✅✅ Produced message to ${topic}: `, result);
            console.log('🚀🚀🚀 Data sent to Redpanda 🚀🚀🚀');
        } else {
            console.log('❌❌❌ No data received ❌❌❌');
        }
    } catch (e) {
        console.log('💥💥💥 Error while sending data to Redpanda 💥💥💥');
        console.error(e);
    }
};

const sendCryptoDataPriceToKafka = async (cryptoSymbol, data) => {
    await sendCryptoDataToKafka(producerRealTime, 'crypto-price', cryptoSymbol, data);
};

const sendCryptoDataNewsToKafka = async (cryptoSymbol, data) => {
    console.log('sendCryptoDataNewsToKafka',data);
    console.log('symbol', cryptoSymbol);
    await sendCryptoDataToKafka(producerNews, 'crypto-news', cryptoSymbol, data);
};

const sendCryptoDataHistoryToKafka = async (cryptoSymbol, data) => {
    await sendCryptoDataToKafka(producerRealTime, 'crypto-history', cryptoSymbol, data);
};

const sendLogsToKafka = async (nameOfProgram, logs) => {
    await sendLogsProgramToKafka(producerLogs, 'crypto-logs', nameOfProgram, logs);
};





module.exports = {
    sendCryptoDataPriceToKafka,
    sendCryptoDataNewsToKafka,
    sendCryptoDataHistoryToKafka,
    sendLogsToKafka,

};