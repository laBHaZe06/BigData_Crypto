const { createClient } = require('@clickhouse/client');
const tables = 'crypto_price';

exports.logger = (message) => {
    console.log(`[Clickhouse] ${message}`);
};
const clickhouse = createClient({
    url: process.env.CLICKHOUSE_URL,
    user: process.env.CLICKHOUSE_USER,
    password: process.env.CLICKHOUSE_PASSWORD,
    // database: process.env.CLICKHOUSE_DB
});



exports.connectWhareHouse = async () => {
    try {
        const resp = await clickhouse.query({
            query: `SELECT * FROM ${tables}`,
            format: 'JSONEachRow',
            wait_end_of_query: 1,
        });
        const row = await resp.json();
        // row.map((row) =>
           
        //     console.log(`[Clickhouse] : \n 
        //         id: ${row.id}, 
        //         symbol: ${row.symbol}, 
        //         price: ${row.price}, 
        //         timestamp: ${row.timestamp}
        //     `)
        // );
        if(row !== undefined) {
            console.log(`✅✅✅ ok`);
        } else {
            return null;
        }
        console.log('✅✅✅ Connected successfully to ClickHouse database ✅✅✅ ');
    } catch (error) {
        console.error('Failed to connect to ClickHouse database:', error);
    }
};

exports.getPriceBySymbol = async (symbol) => {
    if (!symbol) {
        console.error('Symbol is not provided');
        return null;
    }
    try {
        const query = `SELECT price FROM ${tables} WHERE symbol='${symbol.toUpperCase()}' GROUP BY price, timestamp ORDER BY timestamp DESC LIMIT 1`;

        const result = await clickhouse.query({ query, format: 'JSONEachRow' });
        const rows = await result.json(); 
        // console.log(`Query result: ${JSON.stringify(rows)}`);
        return rows[0] ? rows[0].price : null; 
    } catch (error) {
        console.error(`Failed to get price for ${symbol} from ClickHouse:`, error);
    }
};

exports.getHistoryPrice = async (cryptoSymbol, limit) => {
    try {
        const query = `SELECT * FROM ${tables} WHERE symbol='${cryptoSymbol}' ORDER BY timestamp DESC LIMIT ${limit}`;
        const result = await clickhouse.query(query);
        return result.rows;
    } catch (error) {
        console.error(`Failed to get history price for ${cryptoSymbol} from ClickHouse:`, error);
    }
};

exports.disconnectDb = async () => {
    try {
        await clickhouse.close();
        console.log('Disconnected from ClickHouse database');
    } catch (error) {
        console.error('Failed to disconnect from ClickHouse database:', error);
    }
};