const axios = require('axios');


const binanceAPI = axios.create({
    baseURL: 'https://api.binance.com/api/v3',
    timeout: 5000,
});

const geckoApi = axios.create({
    baseURL: `https://api.coingecko.com/api/v3/simple/price`,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer :'+ process.env.COINGECKO_TOKEN,
    },
});


const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
async function getCryptoPriceBinance(symbol) {
    
    try{

        //envoyer le symbol toute les 
        const response = await binanceAPI.get(`/ticker/price?symbol=${symbol}USDT`);
        console.log('Response: ' + JSON.stringify(response.data));
        if(response.data === undefined || response.data === null) {
            console.log('❌❌❌ No data received ❌❌❌');
            return;
        } else if (response.data === 429 ) {
            await delay(8000);
            console.log("🚀🚀🚀 En attente .........\n status code :" + response.data)
            return getCryptoPriceBinance(symbol);
        } else {
            return response.data;
        }

        
    } catch (error) {
        console.error(`Erreur inattendue: ${error}`);
        throw error;
    }

}

// async function getCryptoHistoryBinance(symbol, interval, limit) {
//     try {
//         const response = await binanceAPI.get(`/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
//         return response.data;
//     } catch (error) {
//         throw error;
//     }
// }

async function getPriceCryptoGecko(value) {
    const response = await geckoApi.get(`?ids=${value}&vs_currencies=usd&include_24hr_change=true`);
    try {
        // console.log('💫💫💫💫💫💫💫💫💫💫💫💫💫💫💫💫💫💫💫💫response.data', response.data);
        return response.data;
    } catch (error) {
        if(response.response.status === 429) {
            await delay(8000);
            console.log("🚀🚀🚀 En attente .........\n status code :" + response.response.statusCode)
            return getPriceCryptoGecko(value);
        }
        throw error;
    }
}




module.exports = {
    getCryptoPriceBinance,
    getPriceCryptoGecko,
    // getCryptoHistoryBinance,
}

