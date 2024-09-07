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

const connectProducer = async (producer) => {
    try {
        await producer.connect();
        console.log('✅✅✅ Connected to Redpanda ✅✅✅');
    } catch (e) {
        console.error('💥💥💥 Error while connecting to Redpanda 💥💥💥 : '+ e);
    }
};

const sendCryptoDataToKafka = async (producer, topic, key, value) => {
    // console.log("VALUE" +JSON.stringify(value));
    try {
        await connectProducer(producer);
        // console.log(`Topic : ${topic}   : ${key} : ${JSON.stringify(value)}`);
        await createTopic(topic);

        if (value !== undefined && value !== null) {
            // console.log('✅✅✅ Data received ✅✅✅');
            await producer.send({
                topic: topic,
                partitions: 1,
                messages: [
                    {
                        key: key.toString(),
                        value: JSON.stringify(value),
                    },
                ],
            });
            console.log('✅✅✅ Data sent to Redpanda ✅✅✅');
        } else {
            console.log('❌❌❌ No data received ❌❌❌');
        }
    } catch (e) {
        console.log('💥💥💥 Error while sending data to Redpanda 💥💥💥 : ' +e);
    }
};



//function pour envoyer des logs à kafka 
const sendLogsProgramToKafka = async (producer, topic, key, value) => {
    try {
        await connectProducer(producer);
        // console.log(`Topic : ${topic}   symbol: ${key} : ${value}`);
        await createTopic(topic);

        if (value !== undefined && value !== null) {
            // console.log('✅✅✅ Data received ✅✅✅' + value.value);
            const result = await producer.send({
                topic: topic,
                partitions: 1,
                messages: [
                    {
                        key: JSON.stringify(key),
                        value: JSON.stringify(value.value),
                    },
                ],
            });
            console.log('✅✅✅ Data sent to Redpanda ✅✅✅');
        } else {
            console.log('❌❌❌ No data received ❌❌❌');
        }
    } catch (e) {
        console.log('💥💥💥 Error while sending data to Redpanda 💥💥💥 : ' + e);
    }
};

const sendCryptoDataPriceToKafka = async (cryptoSymbol, data) => {
    if(cryptoSymbol !== undefined && data !== undefined && data !== null && cryptoSymbol !== null) {
        await sendCryptoDataToKafka(producerRealTime, 'crypto-price', cryptoSymbol, data);
    } else {
        return;
    }
};

const sendCryptoDataHistoryToKafka = async (cryptoSymbol, data) => {
    if(cryptoSymbol !== undefined && data !== undefined && data !== null && cryptoSymbol !== null) {
    await sendCryptoDataToKafka(producerRealTime, 'crypto-history', cryptoSymbol, data);
    } else {
        return;
    }
};

const sendCryptoDataNewsToKafka = async (cryptoSymbol, data) => {
    if(cryptoSymbol !== undefined && data !== undefined && data !== null && cryptoSymbol !== null) {
    await sendCryptoDataToKafka(producerNews, 'crypto-news', cryptoSymbol, data);
    } else {
        return;
    }
};


const sendLogsToKafka = async (nameOfProgram, logs) => {
    if(nameOfProgram!== undefined && logs!== undefined && logs!== null && nameOfProgram!== null) {
    await sendLogsProgramToKafka(producerLogs, 'crypto-logs', nameOfProgram, logs);
    } else {
        return;
    }
};





module.exports = {
    sendCryptoDataPriceToKafka,
    sendCryptoDataNewsToKafka,
    sendCryptoDataHistoryToKafka,
    sendLogsToKafka,

};