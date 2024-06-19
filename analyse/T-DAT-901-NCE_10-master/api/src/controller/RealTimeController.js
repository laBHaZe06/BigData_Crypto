const KafkaProducer = require('../config/redpanda/producer');
const WebSocketService = require('../services/ws/WebSocketService');
const webSocketService = new WebSocketService();
const { getCryptoPriceBinance, getCryptoHistoryBinance, getPriceCryptoGecko } = require('../services/api/httpRealTimeApi');    
const {replaceSymbols } = require('../services/serviceFlux/function');

async function getRealTimePriceBinance(cryptoSymbol) {
    console.log('symbol',cryptoSymbol);
    //mettre le paramatre en majuscule
    const symbol = replaceSymbols(cryptoSymbol);
    try {
        const price = await getCryptoPriceBinance(symbol);
        if (price !== undefined && price !== null) {
            KafkaProducer.sendCryptoDataPriceToKafka(cryptoSymbol, price);
            webSocketService.sendToWebSocketClients({
                source: 'Binance-realtime',
                data: {
                    symbol: cryptoSymbol,
                    price: price,
                },
            });
            return price;
        } else {
            console.log('❌❌❌ No data received ❌❌❌');
        }
    } catch (error) {
        console.error(error);
    }
}

async function getRealTimePriceGecko(cryptoSymbol) {
 
    try {
        const price = await getPriceCryptoGecko(cryptoSymbol);
        if (price !== undefined && price !== null) {
            KafkaProducer.sendCryptoDataPriceToKafka(cryptoSymbol, price);
            webSocketService.sendToWebSocketClients({
                source: 'Gecko-realtime',
                data: {
                    symbol: cryptoSymbol,
                    price: price,
                },
            });
            return price;
        } else {
            console.log('❌❌❌ No data received ❌❌❌');
        }
    } catch (error) {
        console.error(error);
    }
}

async function getHistoryPrice(cryptoSymbol) {
    const interval = '1h';
    const limit = 1000;
    //mettre le paramatre en majuscule
    const symbol = replaceSymbols(cryptoSymbol);
    try {
        const history = await getCryptoHistoryBinance(symbol, interval, limit);
        if (history !== undefined && history !== null) {
            KafkaProducer.sendCryptoDataHistoryToKafka(cryptoSymbol, history);
            webSocketService.sendToWebSocketClients({
                source: 'Binance-history',
                data: {
                    symbol: cryptoSymbol,
                    history: history,
                },
            });
            return history;
        } else {
            console.log('❌❌❌ No data received ❌❌❌');
        }
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    getRealTimePriceBinance,
    getRealTimePriceGecko,
    getHistoryPrice,
}




