const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

const url = process.env.MONGO_URI || 'mongodb+srv://labhaze:labhaze@crypto.wgao2i4.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(url);
const dbName = process.env.MONGO_DB || 'crypto_viz';

let db;

exports.connectDb = async () => {
    try {
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        await client.connect();
        db = client.db(dbName);
        console.log("💫 Connected successfully to MongoDB with MongoClient 💫");
    } catch (error) {
        console.error('Error connecting to MongoDB', error);
    }
};

exports.saveNewsToMongo = async (topic, data, key, analyseSentiment) => {
    const session = client.startSession();
    session.startTransaction();
    try {
        const collection = db.collection(topic);
        const document = {
            topic: topic,
            key: data,
            data: key,
            sentimentScore: analyseSentiment,
            timestamp: new Date(),
        };
        await collection.insertOne(document, { session });
        await session.commitTransaction();
        console.log('✅✅✅ Data saved to MongoDB ✅✅✅');
    } catch (error) {
        console.error(`❌❌❌ Error saving data to MongoDB: ${error.message}`);
        await session.abortTransaction();
    } finally {
        session.endSession();
    }
};

exports.savePriceToMongo = async (topic, symbol, price) => {
    const session = client.startSession();
    session.startTransaction();
    try {
        const collection = db.collection(topic);
        const document = {
            topic: topic,
            key: symbol,
            data: price,
            timestamp: new Date(),
        };
        await collection.insertOne(document, { session });
        await this.removeOldData(topic);
        await session.commitTransaction();
        console.log('✅✅✅ Data saved to MongoDB ✅✅✅');
    } catch (error) {
        console.error(`❌❌❌ Error saving data to MongoDB: ${error.message}`);
        await session.abortTransaction();
    } finally {
        session.endSession();
    }
};

//remove data from MongoDB that is older than one month or more
exports.removeOldData = async (topic) => {
    const collection = db.collection(topic);
    const date = new Date();
    //remove old data from MongoDB that is older thanone day or more
    date.setDate(date.getDate() - 1); // remove data older than one day
    console.log(`Removing old data older than ${date.toISOString()} from ${topic} collection...`);
    await collection.deleteMany({ timestamp: { $lt: date } });
    console.log('✅✅✅ Old data removed from MongoDB ✅✅✅');
}