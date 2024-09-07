const { ClickHouseClient, createClient } = require('@clickhouse/client');
const { v4: uuidv4 } = require('uuid');

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

const retry = async (fn, retries = 5, delay = 1000) => {
    try {
        return await fn();
    } catch (err) {
        if (retries > 0) {
            console.warn(`Retrying in ${delay / 1000} seconds... (${retries} retries left)`);
            await new Promise(res => setTimeout(res, delay));
            return retry(fn, retries - 1, delay);
        } else {
            throw err;
        }
    }
};

exports.connectWhareHouse = async () => {
    try {
        await retry(() => clickhouse.query({
            format: 'JSONEachRow',
            query: `CREATE TABLE IF NOT EXISTS ${tables}  (
                id String,
                symbol String,
                price Float64,
                timestamp DateTime DEFAULT NOW()) 
                ENGINE = MergeTree()
                ORDER BY (id);`}));

        console.log(`✅✅✅ [Clickhouse] Table ${tables} created successfully.✅✅✅ `);

        await retry(() => clickhouse.query({
            query: `SELECT * FROM ${tables}`,
        }));
        
        console.log('✅✅✅ Connected successfully to ClickHouse database ✅✅✅ ');
    } catch (error) {
        console.error('Failed to connect to ClickHouse database:', error);
    }
};

exports.pushPriceBySymbol = async (symbol, price, timestamp) => {
    try {

        console.log('✅ Insert parameters:', { symbol, price, timestamp}) ;

        if (!symbol || !price || !timestamp) {
            throw new Error('Symbol, price, or timestamp is missing');
        }
    
        // const query = `INSERT INTO ${tables} (id,symbol, price, timestamp) VALUES ('${uuidv4()}','${symbol}', ${price}, '${timestamp}');`;

        // console.log('Executing query:', query);
        const id = uuidv4();

        try {
            await clickhouse.insert({
                format: 'JSONEachRow',
                table: tables,
                values: {
                    id: id,
                    symbol: symbol,
                    price: price,
                    timestamp: timestamp,
                    params: [],
                }
            });
            console.log(`✅ Data inserted successfully for ${symbol}`);

        } catch (e) {
            console.error('Error during query execution:', e);
        }
    } catch (e) {
        console.error('Failed to insert data into ClickHouse:', e);
    }
};
// exports.getHistoryPrice = async (cryptoSymbol, limit) => {
//     try {
//         const query = `SELECT * FROM crypto_viz WHERE symbol = '${cryptoSymbol}' ORDER BY timestamp DESC LIMIT ${limit}`;
//         const result = await clickhouse.query({ query });
//         return result.rows;
//     } catch (error) {
//         console.error(`Failed to get history price for ${cryptoSymbol} from ClickHouse:`, error);
//     }
// };

exports.disconnectDb = async () => {
    try {
        await clickhouse.close();
        console.log('Disconnected from ClickHouse database');
    } catch (error) {
        console.error('Failed to disconnect from ClickHouse database:', error);
    }
};

