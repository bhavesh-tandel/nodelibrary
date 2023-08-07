const express = require('express');
const router = express.Router();

const exceljsRouteFunction = require('./exceljs-controller');

router.route('/convert-json-to-excel').post(exceljsRouteFunction.jsonToExcel);

router.route('/convert-excel-json').post(exceljsRouteFunction.excelToJson);

// router.route('/populate-data').post(exceljsRouteFunction.excelToJson);

module.exports = router;