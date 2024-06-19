const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cryptoSchema = new Schema({
    date: String,
    open: Number,
    high: Number,
    low: Number,
    close: Number,
    Adj_Close: Number,
    volume: Number
});


const Crypto = mongoose.model('crypto', cryptoSchema);

module.exports = new Crypto();