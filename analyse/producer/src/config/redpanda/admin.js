const { Kafka } = require("kafkajs");

const redpanda = new Kafka({
    brokers: ["redpanda:9092"],
});
const admin = redpanda.admin();

const createTopic = async (topic, partitions) => {
    
    try {
        await admin.connect();
        // console.log('✅ Connected to Redpanda ✅');
        // console.log('🌍🌍🌍 Creating topic 🌍🌍🌍' + JSON.stringify(topic.value));
        const existingTopics = await admin.listTopics();
        // console.log('🌍🌍🌍 List of existing topics 🌍🌍🌍');
        // console.log(existingTopics);

        if (!existingTopics.includes(topic) === false) {
            await admin.createTopics({
                topics: [
                    {
                        topic: topic,
                        partitions: partitions ? partitions : 1,
                        configEntries: [
                            {
                                name: 'retention.ms',
                                // 10 minutes
                                value: '600000'
                            }
                        ]
                    },
                ],
            });
            console.log("✅✅✅ Topic created ✅✅✅");
        } else {
            console.log("🌍🌍🌍 Topic already exists 🌍🌍🌍 ");
        }
    } catch (error) {
        console.error(`💥💥💥 Error TOPIC : ${topic.value}. Error creating  : ${error} 💥💥💥 `);
        await admin.disconnect();
    } 
};

module.exports = {
    createTopic,
};