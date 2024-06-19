const express = require('express');
const CsvController = require('../controller/CsvController.js');
const routerCsv = express.Router();

// routerCsv.get('/', (req, res) => {
//     res.redirect('/');
// });

routerCsv.post('/', CsvController.readCsv);

module .exports = routerCsv;