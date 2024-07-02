const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    topic: { type: String, required: true },
    key: { type: String, required: true },
    data: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
}, { timestamps: true, collection: 'crypto-price' }); // Spécifie le nom de la collection

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;