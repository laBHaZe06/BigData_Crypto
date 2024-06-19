const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');


const url = process.env.MONGO_URI || 'mongodb+srv://labhaze:labhaze@crypto.wgao2i4.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(url);

// Database Name
const dbName = process.env.MONGO_DB || 'crypto-viz';

exports.connectDb = async() => {
    try{
        mongoose.connect(url);
        const db = client.db(dbName);
        console.log("💫 Connected successfully to database 💫 : ", dbName);
        return db;
    } catch (err) {
        console.log(err);
    }
}

exports.saveToMongo = async (topic, data, key) => {
    try {
        const db = client.db('crypto-viz');
        const collection = db.collection(topic);
        const document = {
            topic: topic,
            key: key,
            data: JSON.parse(data), 
            timestamp: new Date(),
        };
        await collection.insertOne(document);
        console.log('✅✅✅ Data saved to MongoDB ✅✅✅');
    } catch (error) {
        console.error(`❌❌❌ Error saving data to MongoDB: ${error.message}`);
    }
};



exports.getDb = () => {
    return client.db(dbName);
}


