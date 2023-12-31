const swaggerAutogen = require('swagger-autogen');


const doc = {
    info: {
        version: "1.0.0",
        title: "My API",
        description: "Documentation automatically generated by the <b>swagger-autogen</b> module."
    },
    host: "localhost:9000",
    basePath: "/",
    schemes: ['http', 'https'],
    consumes: ['application/json',''],
    produces: ['application/json'],
    tags: [

        {
            "name": "Excel",
            "description": "Endpoints"
        },
        {
            "name": "Email Notification",
            "description": "Email Notification"
        }
    ],
    securityDefinitions: {
        apiKeyAuth: {
            type: "apiKey",
            in: "header",       // can be "header", "query" or "cookie"
            name: "X-API-KEY",  // name of the header, query parameter or cookie
            description: "any description..."
        }
    },
    definitions: {
        /**$ is required */
        // ConvertExceltoJson_HeaderData: {
        //     $headerdata: [
        //         { $header: "Asset Code", "value": "", $key: "asset_code" },
        //         { $header: "Asset Name", "value": "", $key: "asset_name" },
        //     ]
        // },
        // ConvertExceltoJson_UniqueKey: {
        //     $headerdata: [
        //         { $header: "Asset Code", "value": "", $key: "asset_code" },
        //         { $header: "Asset Name", "value": "", $key: "asset_name" },
        //     ]
        // },
        ConvertJSONtoExcel: {
            $filename: "excel",
            $headerArray: [
                { $header: "Asset Code", "value": "", $key: "asset_code" },
                { $header: "Asset Name", "value": "", $key: "asset_name" },
            ],
            $rows: [
                {
                    "Asset Code": "fui_123",
                    "Asset Name": "Welcome",
                }
            ]
        },
        SMTPEmailOptions:{
            $options: {
                // host: 'smtp.falconide.com',
                $host: 'XXXXXX',
                $port: 587,
                $secure: false, // TLS is disabled
                tls: { rejectUnauthorized: false },
                $auth: {
                    $user: 'XXXXXX',
                    // pass: 'T95cDH^sdV&$Phq'
                    $pass: 'XXXXXX',
                }
            },
            $from: "ILLUME<no-reply@bajajfinserv.in>",
            $to:["XXXXX@mobeserv.com","XXXXX@mobeserv.com"], 
            $subject: "Email Testing",
            $html: "Testing Email",
            cc: ["XXXXX@gmail.com"],
            bcc: ["XXXXX@gmail.com"],
            attachment: [{
                filename: 'logo.png',
                path: 'https://learner.edgelearning.co.in/assets/images/auth/BajajFinserv_Logo.png'
            }]
        },
        SESEmailOptions:{
            $options: {
                accessKeyId:"XXXXXXUOV7VDH52G7H74",
                secretAccessKey:"XXXXXX/dR9r/cSR1otXfYJ/a53vKn5TztRV7yiertV"
            },
            $from: "Edge<bhavesh@mobeserv.com>",
            $to:["team@mobeserv.com","paresh@mobeserv.com"], 
            $subject: "Email Testing",
            $html: "Testing Email",
            cc: ["XXXXX@gmail.com"],
            bcc: ["XXXXX@gmail.com"],
            attachment: [{
                filename: 'logo.png',
                path: '/home/umesh/Bhavesh/mobeserv/library/nodelibrary/lib/emailservice/assets/ILLUME-logo.png'
            }]
        }
    }
}
const options = {
    // openapi: <string>,          // Enable/Disable OpenAPI. By default is null
    // language: <string>,         // Change response language. By default is 'en-US'
    // disableLogs: <boolean>,     // Enable/Disable logs. By default is false
    // autoHeaders: <boolean>,     // Enable/Disable automatic headers capture. By default is true
    // autoQuery: <boolean>,       // Enable/Disable automatic query capture. By default is true
    autoBody: false        // Enable/Disable automatic body capture. By default is true
}
const outputFile = './doc/swagger-output.json'
const endpointsFiles = ['./server.js']

swaggerAutogen(options)(outputFile, endpointsFiles, doc).then(() => {
    require('./server')           // Your project's root file
})