const Parser = require('rss-parser');
const {filtrerFluxRSS, fetchRss , replaceSymbols } = require('../serviceFlux/function');


const tokenCryptoPanic = process.env.CRYPTOPANIC_TOKEN;





async function getFluxBenzinga(value) {
    try {
        (value === "ethereum") ? value === "ethereum-cryptommonnaies" : value;
        const feedUrl = `https://fr.benzinga.com/category/cryptomonnaies/${value}/feed/`;
        const result = await fetchRss(feedUrl);
        return result;
    } catch (error) {
        throw error;
    }
}

async function getFluxCoinTelegraph(cryptoSymbol) {
    (cryptoSymbol === "ethereum")? cryptoSymbol === "ethereum-cryptommonnaies" : cryptoSymbol;
    try {
        const feedUrl = `https://fr.cointelegraph.com/rss/tag/${cryptoSymbol}`;
        const result = await fetchRss(feedUrl);
        // console.log('result', result);
        return result;
    } catch (error) {
        throw error;
    }
}

async function getFluxCoinJournal() {
    try{
        const feedUrl = `https://coinjournal.net/news/category/markets/feed/`;
        const coinJournalFeed = await filtrerFluxRSS(feedUrl);
        return coinJournalFeed;
    } catch (error) {
        throw error;
    }
}


async function getFluxCryptoPanic(cryptoSymbol) {
    const symbol = await replaceSymbols(cryptoSymbol);
    try{
        const feedUrl = `https://cryptopanic.com/api/v1/posts/?auth_token=${tokenCryptoPanic}&currencies=${symbol}&filter=rising&format=rss`;
    const result = await filtrerFluxRSS(feedUrl);
    return result;
    } catch (error) {
        throw error;
    }
}




module.exports = {
    getFluxBenzinga,
    getFluxCoinTelegraph,
    getFluxCoinJournal,
    getFluxCryptoPanic,
};