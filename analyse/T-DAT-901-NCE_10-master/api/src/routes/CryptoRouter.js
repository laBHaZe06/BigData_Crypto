const express = require('express');
const { getHistoryPrice, getRealTimePriceBinance, getRealTimePriceGecko } = require('../controller/RealTimeController.js');
const { FindNewsCryptoBenzinGa, FindNewsCryptoCoinTelegraph, FindNewsCryptoPanic } = require('../controller/FluxController.js');

const routerCrypto = express.Router();

routerCrypto.get('/realtime-a/:cryptoSymbol', getRealTimePriceBinance);
routerCrypto.get('/realtime-b/:cryptoSymbol', getRealTimePriceGecko);
routerCrypto.get('/history/:cryptoSymbol/:interval/:limit', getHistoryPrice);
routerCrypto.get('/sentiment-a/:cryptoSymbol', FindNewsCryptoBenzinGa);
routerCrypto.get('/sentiment-b/:cryptoSymbol', FindNewsCryptoCoinTelegraph);
routerCrypto.get('/sentiment-c/:cryptoSymbol', FindNewsCryptoPanic);


module.exports = routerCrypto;