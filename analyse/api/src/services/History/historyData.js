const [getHistoryPrice] = require('../../config/clickhouse');

exports.historyPrice = async (req, res) => {
    const symbol = req.params.symbol;
    const limit = parseInt(req.query.limit) || 10;

    const history = await getHistoryPrice(symbol, limit);

    if (history.length > 0) {
        res.status(200).json(history);
    } else {
        res.status(404).json({ message: `No history data found for symbol ${symbol}` });
    }
};
