const axios = require('axios');


const binanceAPI = axios.create({
    baseURL: 'https://api.binance.com/api/v3',
    timeout: 1000,
});

const geckoApi = axios.create({
    baseURL: `https://api.coingecko.com/api/v3/simple/price`,
    timeout: 1000,
    headetrs: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer :'+ process.env.COINGECKO_TOKEN,
    },
});


const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
async function getCryptoPriceBinance(symbol) {
        try {
            const response = await binanceAPI.get(`/ticker/price?symbol=${symbol}USDT`);
            await delay(3000); // 3seconds
            console.log('response.data', response.data);
            return response.data;
        } catch (error) {
            throw error;
        }
}

async function getCryptoHistoryBinance(symbol, interval, limit) {
    try {
        const response = await binanceAPI.get(`/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

async function getPriceCryptoGecko(value) {
    try {
        //intégrer le token dans l'url pour avoir accès aux flux rss
        const response = await geckoApi.get(`?ids=${value}&vs_currencies=usd&include_24hr_change=true`);
        await delay(3000); // 3seconds
        console.log('response.data', response.data);
        return response.data;
    } catch (error) {
        throw error;
    }
}




module.exports = {
    getCryptoPriceBinance,
    getPriceCryptoGecko,
    getCryptoHistoryBinance,
}

