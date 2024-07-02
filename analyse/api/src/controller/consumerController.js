
const WebSocketService = require('../services/ws/WebSocketService');
const webSocketService = new WebSocketService();


const messages = []; // Store messages 
webSocketService.on('message', (message) => {
    console.log('Storing message:', message);
    messages.push(message); // Store messages
});
const getMessages = async (req, res) => {
    try {
        console.log("Messages found:", messages);
        webSocketService.broadcast({ message: 'Messages fetched', messages}); // Envoyer un message aux clients WebSocket
        res.status(200).json(messages); // Envoyer les messages via HTTP
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).send('Error fetching messages');
    }
};


const getMessagesByTopic = async (req, res) => {
    // const { topic } = req.params;
    try {
        console.log("Messages found:", messages);
        webSocketService.sendToWebSocketClients(messages); // Envoyer les messages aux clients WebSocket
        res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).send('Error fetching messages');
    }
};

module.exports = { getMessages, getMessagesByTopic };