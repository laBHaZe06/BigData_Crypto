const express = require('express');
const { getMessages, getMessagesByTopic } = require('../controller/consumerController');
const router = express.Router();

router.get('/realtime/:symbol', getMessages);
router.get('/messages/:topic', getMessagesByTopic);

module.exports = router;
