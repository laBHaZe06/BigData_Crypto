const Kafka = require('node-rdkafka');

const redpanda = new Kafka({
    brokers: ["localhost:9092"]
});
const admin = redpanda.admin();

function createTopic(topicName, numPartitions, replicationFactor) {
    return new Promise((resolve, reject) => {
        admin.createTopic({
            topic: topicName,
            num_partitions: numPartitions,
            replication_factor: replicationFactor
        }, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function configureRedpanda() {
    return new Promise((resolve, reject) => {
        admin.connect({
            timeout: 10000
        }, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function produceMessage(topicName, message) {
    return new Promise((resolve, reject) => {
        const producer = redpanda.producer();
        producer.connect();
        producer.on('ready', () => {
            producer.produce(topicName, null, Buffer.from(message), null, Date.now());
            producer.disconnect();
            resolve();
        });
        producer.on('event.error', (err) => {
            reject(err);
        });
    });
}

function deleteTopic(topicName) {
    return new Promise((resolve, reject) => {
        admin.deleteTopic(topicName, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

module.exports = {
    createTopic,
    configureRedpanda,
    produceMessage,
    deleteTopic
};

