const { connectDb } = require('../config/db');
const { Bitcoin, Ethereum } = require('../models/Crypto/Crypto');
const { log } = require('console');
const KafkaProducer = require('./redpanda/producer');
const { httpCoinGeckoHistory, httpCoinGeckoRealTime } = require('../services/api/httpRealTimeApi');
const { httpFluxCoinJournal, httpFluxCoinDesk, httpFluxCoinTelegraph } = require('../services/api/httpFlux');



// crypto in mongoDB history
exports.findAllBtc = async (req, res) => {
    try {
        const db = await connectDb();
        const collection = db.collection('bitcoin');
        const dataBtc = await collection.find().toArray();

        if (dataBtc.length > 0) {
            const collectionName = collection.collectionName;
            await KafkaProducer.sendCryptoDataToKafka(collectionName, dataBtc);
            res.json(dataBtc);
        } else {
            res.status(404).json({
                message: 'Crypto not found'
            });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
};
// get one crypto btc
exports.findOneBtc = async (req, res) => {
    const id = req.params.id;
    const db = await connectDb();
    const collection = db.collection('bitcoin');
    const crypto = await Bitcoin.findOne({ id: id });

    if (crypto) {
        await KafkaProducer.sendCryptoDataToKafka(collection.collectionName, [crypto]);
        res.json(crypto);
    } else {
        res.status(404).json({
            message: 'Crypto not found'
        });
    }
};
// get all crypto eth
exports.findAllEth = async (req, res) => {
    try {
        const db = await connectDb();
        const collection = db.collection('ethereum');
        const dataEth = await collection.find().toArray();

        if (dataEth.length > 0) {
            await KafkaProducer.sendCryptoDataToKafka(collection.collectionName, dataEth);
            res.json(dataEth);
        } else {
            res.status(404).json({
                message: 'Crypto not found'
            });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
};

// get one crypto eth
exports.findOneEth = async (req, res) => {
    const id = req.params.id;
    try {
        const crypto = await Ethereum.findOne({ id: id });

        if (crypto) {
            await KafkaProducer.sendCryptoDataToKafka('ethereum', [crypto]);
            res.json(crypto);
        } else {
            res.status(404).json({
                message: 'Crypto not found'
            });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
};
// find all collections crypto btc and eth
exports.findAll = async (req, res) => {
    try {
        const btc = await this.findAllBtc();
        const eth = await this.findAllEth();
        const data = {
            btc,
            eth
        };

        await KafkaProducer.sendCryptoDataToKafka('allCollections', data);

        res.json(data);
    } catch (e) {
        console.error(e);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
};





