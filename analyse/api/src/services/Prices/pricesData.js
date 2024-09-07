const {getPriceBySymbol} = require('../../config/clickhouse');


exports.priceBySymbol = async (symbol) => {
    try {
        const price = await getPriceBySymbol(symbol);
        console.log(price);
        if (price === undefined || price === null) {
            console.log('No price data found for symbol ' + symbol );
        } else {
            //return price decimal value
            return price.toFixed(5);
        }
    } catch (error) {
        console.error('Error fetching price:', error);
    }
};



// Ajoutez des routes pour les nouvelles fonctionnalités
