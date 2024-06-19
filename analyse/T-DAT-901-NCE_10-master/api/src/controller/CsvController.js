var http = require('http');
var formidable = require('formidable');
const fs = require('fs');
const csv = require('csv-parser');
const { connectDb } = require('../config/db');
const {Crypto} = require('../models/Crypto/Crypto');
const { sendCryptoDataToKafka } = require('../config/redpanda/producer');
const path = require('path');

//function qui lit les csv dans le dossier uploads se trouvant dans le dossier public et les envoie dans la base de données
exports.readCsv = async (req, res) => {
    try {
        const db = await connectDb();
        //lire le nom du fichier csv dans le dossier uploads sans l'extension .csv
        const fileName = req.body;
        //on récupère le nom du fichier csv sans l'extension .csv
        const collectionName = fileName.split('.').slice(0, -1).join('.');
        const collection = db.collection(collectionName);
        //si la collection n'existe pas, on la crée
        if (collection === null) {
            await db.createCollection(collectionName);
            console.log('Collection created');
        } else {
            console.log('Collection already exists');
        }
        //on lit les fichiers csv dans le dossier uploads
        fs.readdir('./public/uploads', async (err, files) => {
            if (err) {
                console.log(err);
            } else {
                files.forEach(async (file) => {
                    const data = [];
                    fs.createReadStream(`./public/uploads/${file}`)
                        .pipe(csv())
                        .on('data', (row) => {
                            data.push(row);
                        })
                        .on('end', async () => {
                            await collection.insertMany(data);
                            console.log('Data inserted');
                            await sendCryptoDataToKafka(collection.collectionName, data);
                        });
                });
            }
        });
        res.status(200).json({
            message: 'Csv file(s) inserted'
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
}

