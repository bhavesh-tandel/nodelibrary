const express = require('express');
const app = express();

const exceljsrouter = require('../lib/excel-js/exceljsRouter');
app.use('/excel', exceljsrouter);

const emailrouter = require('./emailservice/smtp/SMTPRouter');
app.use('/email', emailrouter);

const emailsesrouter = require('./emailservice/ses/SESRouter');
app.use('/email', emailsesrouter);

module.exports = app;