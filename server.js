var express = require('express'),
bodyParser = require('body-parser'),
compression = require('compression'),
server = express(),
fileUpload = require('express-fileupload')
app = require('http').Server(server),
swaggerUi = require('swagger-ui-express'),
swaggerFile = require('./doc/swagger-output.json'),
port = 9000;


// Compress all HTTP responses
server.use(compression());
server.use(fileUpload());
server.use(bodyParser.urlencoded({ extended: false, limit: '500mb' }));
server.use(bodyParser.json({ limit: '500mb' }));

const mainRoutes = require('./lib/routes');

/* Middlewares */
server.use('/api', mainRoutes);
server.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))


app.listen(port, function() {
 console.log('Example app listening on port ',port,'!')
})
