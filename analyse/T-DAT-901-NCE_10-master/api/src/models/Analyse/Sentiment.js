const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SentimentSchema = new Schema({
    Date: String,
    Crypto: String,
    Sentiment: Number,
    Positive: Number,
    Negative: Number,
    Neutral: Number,
    Score: Number
});

const Sentiment = mongoose.model('sentiment', SentimentSchema);

module.exports = new Sentiment();
