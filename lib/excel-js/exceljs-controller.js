const exceljsHelper = require('./exceljsHelper')
const fs = require('fs');

exports.jsonToExcel = (req, res) => {
    /* 	#swagger.tags = ['Excel']
        #swagger.description = 'API to convert json to excel' */

    /*	#swagger.parameters['obj'] = {
            in: 'body',
            description: 'API to convert json to excel.',
            required: true,
            schema: { $ref: "#/definitions/ConvertJSONtoExcel" }
    } */
    const object = req.body;
    const workbook = exceljsHelper.jsonToExcel(object);
    // res.status(200).json({ type: true, body: req.body });

    // res is a Stream object
    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
        "Content-Disposition",
        "attachment; filename=" + object["filename"] + ".xlsx"
    );
    return workbook.xlsx.write(res).then(function() {
        res.status(200).end();
    });
}

exports.excelToJson = async (req, res, next) => {
    /* 	#swagger.tags = ['Excel']
        #swagger.description = 'API to convert Excel to json' 
        #swagger.parameters['file'] = {
            in: 'formData',
            type: 'file',
            description: 'API to convert Excel to json.',
            required: true,
    }
    #swagger.parameters['uniquekey'] = {
            in: 'formData',
            type: 'string',
            description: 'Unique Key to convert data',
            required: true
    }
    #swagger.parameters['headerdata'] = {
            in: 'formData',
            type: 'string',
            description: 'Excel Header Data',
            required: true
    }
    
    */
    
    var {headerdata, uniquekey} = req.body; // Will be ignored by swagger-autogen
    try {
        headerdata = JSON.parse(headerdata);
    } catch (error) {
        headerdata = headerdata;
    }
    // const uniquekey = body.uniquekey;
    if (!req.files) {
        /* #swagger.responses[400] = {
            description: 'Uploaded file was empty'
        } */
        res.status(400).json({ type: false, data: 'Please select a file' });
        return;
    } else {
        const file = req.files.file;
        var { err, data } = await uploadfiles(file);
        if(!err){
            exceljsHelper.excelToJson(filepath, headerdata, uniquekey, (status, result) => {
                if (status) {
                    /* #swagger.responses[200] = {
                        description: 'File uploaded'
                    } */
                    res.status(200).json({ type: status, data: result });
                } else {
                    /* #swagger.responses[500] = {
                        description: 'Error Occured while processing'
                    } */
                    res.status(500).json({ type: status, data: result });
                }
                deleteTempFile(filepath);
            });
        } else {
            // deleteTempFile(data);
            /* #swagger.responses[500] = {
                description: 'Error Occured while uploading file'
            } */
            res.status(500).json({ type: false, data: data });
        }
    }
}
function uploadfiles(file) {
    return new Promise((resolve, reject)=>{
        try {
            if(!file){ return resolve(true, 'File not found');}

            const newpath = __dirname + '/content/' + file.name;
            file.mv(newpath)
            .then(() => {
                resolve({err: false, data: newpath});
            })
            .catch(err => {
                resolve({err: true, data: err.message});
            });      
        } catch (error) {
            resolve({err: true, data:error.message});
        }
    })
}

function deleteTempFile(path) {
    if (fs.existsSync(path)) {
        fs.unlinkSync(path);
    }
}
