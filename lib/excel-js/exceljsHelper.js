require('regenerator-runtime/runtime');
const path = require('path');
const ExcelJS = require('exceljs/dist/es5');
const fs = require('fs');
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");

var moment = require('moment');
let number = 100;

var uniqueKey = 'Asset Code';

exports.jsonToExcel = (data) => {
    const dataPassed = data;
    return createExcel(data);
}

exports.excelToJson = (path, headerData, formatKey, cb) => {
    uniqueKey = formatKey;

    // const file = files.file;
    // uploadfiles(file, (path, message) => {

        if (path) {
            if (path.split('.')[path.split('.').length - 1] === 'xlsx') {
                exceltojson = xlsxtojson;
            } else {
                exceltojson = xlstojson;
            }
            try {
                exceltojson({
                    input: path,
                    output: null, //since we don't need output.json
                    lowerCaseHeaders: false
                }, function (err, result) {
                    if (err) {
                        // console.log('exceltojson', err)
                        cb(false, 'Unable to read excel');

                    } else {
                        // console.log('exceltojson', result);
                        const validateHeaders = validateHeadersOfInput(headerData, result);
                        if (!validateHeaders.error) {
                            const modifiedResult = mergeObjectBasedOnKey(headerData, result);
                            cb(true, modifiedResult)
                        } else {
                            cb(false, validateHeaders.message)
                        }

                    }
                    // deleteTempFile(path);
                });
            } catch (e) {
                // deleteTempFile(path);
                cb(false, 'Unable to read excel');

            }
        } else {
            // deleteTempFile(path);
            cb(false, message);
        }
    // });
}

function getSpreadSheetCellNumber(row, column, addDoller = false) {
    let result = '';

    // Get spreadsheet column letter
    let n = column;
    while (n >= 0) {
        result = String.fromCharCode((n % 26) + 65) + result;
        n = Math.floor(n / 26) - 1;
    }

    // Get spreadsheet row number
    let char = addDoller ? '$' : '';
    result = result + char + `${row + 1}`;

    return result;
}

function createExcel(data) {
    let workbook = new ExcelJS.Workbook();
    let worksheet = workbook.addWorksheet(String(data.filename.slice(0, 20)));
    let worksheetMasterData = workbook.addWorksheet('MasterData');

    worksheet.columns = [...data.headerArray];
    let rowsArrays = [];
    let feelBlankDataFlag = true;
    // let validationRangeArray = {};
    const rangeObj = createValidationSheet(data.headerArray, worksheetMasterData);
    if (Array.isArray(data.rows) && data.rows.length != 0) {
        // rowsArrays = data.rows;
        rowsArrays = divideAssetsIntoArray(data.rows, data.passedUniqueKey);

        // console.log('divideAssetsIntoArray', rowsArrays);
        feelBlankDataFlag = false;
    } else {
        rowsArrays = Array(number).fill('');
        feelBlankDataFlag = true;
    }

    for (let index = 0; index < rowsArrays.length; index++) {
        // const element = array[index];
        const object = {};
        data.headerArray.forEach(element => {
            if (feelBlankDataFlag) {
                object[element.key] = '';
            } else {
                if (element["isDate"] == 1) {
                    // object[element.key] = new Date(rowsArrays[index][element.header]);
                    object[element.key] = rowsArrays[index][element.header] ? new Date(moment(rowsArrays[index][element.header]).utcOffset(0, true)) : '';
                    
                } else {
                    object[element.key] = rowsArrays[index][element.header];
                }
            }

        });
        worksheet.addRow(object);

        data.headerArray.forEach((element, j) => {
            if (Array.isArray(element.value)) {
                const jsonDropdown = element.value;
                worksheet.getCell(
                    getSpreadSheetCellNumber(index + 1, j)
                ).dataValidation = {
                    type: 'list',
                    allowBlank: true,
                    showErrorMessage: true,
                    // formulae: [`"${jsonDropdown.join(',')}"`],
                    formulae: [`${rangeObj[element.key]}`],

                    errorStyle: 'error',
                    errorTitle: 'Invalid value',
                    // error: 'The value must be in ' + jsonDropdown.join(',')
                    error: 'Please enter a valid value',

                };

            }
            if (element["convertText"] == 1) {
                const cell = worksheet.getColumn(j);
                cell.eachCell((c) => { c.numFmt = '@'; });
            }
            if (element["isDate"] == 1) {
                const cell = worksheet.getColumn(j);
                cell.eachCell((c) => { c.numFmt = "dd/mm/yyyy\\ h:mm:ss\\ AM/PM"; });
            }

        });



    }
    data.headerArray.forEach((element, j) => {
        if (element["convertText"] == 1) {
            const cell = worksheet.getColumn(j + 1);
            cell.eachCell((c) => { c.numFmt = '@'; });
        }
        if (element["isDate"] == 1) {
            const cell = worksheet.getColumn(j + 1);
            cell.eachCell((c) => { c.numFmt = "dd/mm/yyyy\\ hh:mm:ss"; });
        }

    });
    return workbook;
}


function uploadfiles(file, cb) {
    // if (!fs.existsSync(excelPath)) {
    //     fs.mkdirSync(excelPath, { recursive: true });
    // }
    // let baseDir = path.join(__dirname);
    const newpath = __dirname + '/content/' + file.name;
    file.mv(newpath)
        .then(() => {
            //console.log(path);

            cb(newpath, true);
        })
        .catch(err => {
            // console.log('errpath', err);
            cb(null, 'Unable to save file');
        });
}

function deleteTempFile(path) {
    if (fs.existsSync(path)) {
        fs.unlinkSync(path);
    }
}

function divideAssetsIntoArray(data, passedUniqueKey) {
    const finalArray = [];
    data.forEach((element, index) => {
        const array = Object.keys(element);
        maxLength = 1;
        multiValueKey = {};
        firstFlag = true;
        array.forEach((key, indexj) => {
            const stringArray = String(element[key]).split('%comma%');
            if (stringArray && stringArray.length > 1) {
                if (maxLength < stringArray.length) {
                    maxLength = stringArray.length;
                }
                element[key] = stringArray;
                multiValueKey[key] = stringArray.length;
            }
        });
        while (maxLength != 0) {
            const uniqueKeyFinal = passedUniqueKey ? passedUniqueKey : uniqueKey;
            const object = getObjectFromData(element, multiValueKey, firstFlag, uniqueKeyFinal);
            element = object.element;
            multiValueKey = object.multiValueKey;
            finalArray.push(object.newObject);
            firstFlag = false;
            maxLength--;
        }
    });
    return finalArray;
}

function getObjectFromData(element, multiValueKey, firstFlag, uniqueKeyFinal) {
    const keyArray = Object.keys(element);
    const newObject = {};
    keyArray.forEach((key, index) => {
        if (multiValueKey[key] && multiValueKey[key].length != 0) {
            newObject[key] = String(element[key].splice(0, 1)[0]).trim();
            multiValueKey[key]--;
        } else {
            newObject[key] = firstFlag || key == uniqueKeyFinal ? element[key] : '';
        }
    });
    return { element: element, multiValueKey: multiValueKey, newObject: newObject }
}

function mergeObjectBasedOnKey(headerData, data) {
    const finalArray = [];
    const object = {};
    const headerDataSingleSelect = {};
    headerData.forEach((element) => {
        headerDataSingleSelect[element.header] = element.isSingleSel;
    })
    // console.log('headerDataSingleSelect', headerDataSingleSelect);
    data.forEach((element, index) => {
        if (element[uniqueKey] in object) {
            //    const internalObject =  object[uniqueKey];
            const keyArray = Object.keys(element);
            keyArray.forEach((key, indexj) => {
                if (element[key] && key != uniqueKey) {
                    if (headerDataSingleSelect[key] != 1) {
                        const array = object[element[uniqueKey]][key].split('%comma%');
                        if (array.indexOf(String(element[key]).trim()) == -1) {
                            object[element[uniqueKey]][key] = object[element[uniqueKey]][key] == null || object[element[uniqueKey]][key] == '' ? element[key] : object[element[uniqueKey]][key] + '%comma%' + element[key];
                        }
                    } else {
                        object[element[uniqueKey]][key] = element[key];
                    }
                }
            })
        } else {
            object[element[uniqueKey]] = element;
        }
    });

    // console.log('object', object);

    for (key in object) {
        finalArray.push(object[key]);
    }

    return finalArray;
}

function createValidationSheet(headerArray, worksheetMasterData) {
    if (!headerArray || !Array.isArray(headerArray)) {
        return {};
    }
    if (!worksheetMasterData) {
        return {};
    }
    const valueMapping = {};
    const rangeArray = {};
    let maxValue = 0;
    for (let index = 0; index < headerArray.length; index++) {
        if (headerArray[index]["value"]) {
            const element = headerArray[index];
            const valueArray = element["value"];
            valueMapping[element["key"]] = {
                value: valueArray,
                length: valueArray.length,
            }

            if (maxValue < valueArray.length) {
                maxValue = valueArray.length;
            }
        }
    }

    const masterDatakeys = Object.keys(valueMapping);
    const keyArray = [];
    // const worksheetMasterDataList = [];
    masterDatakeys.forEach((element, index) => {
        keyArray.push({ "id": element });
        let colStart = getSpreadSheetCellNumber(0, index, true);
        let colEnd = getSpreadSheetCellNumber(valueMapping[element]['value'].length - 1, index, true);
        // console.log('colStart', colStart);
        // console.log('colEnd', colEnd)
        rangeArray[element] = 'MasterData!' + '$' + colStart + ':' + '$' + colEnd;
    });
    //  console.log('rangeArray', rangeArray);
    worksheetMasterData.columns = keyArray;
    for (let index = 0; index < maxValue; index++) {
        // const element = array[index];
        const array = [];
        masterDatakeys.forEach((element) => {
            // keyArray.push({"id": element})
            if (index < valueMapping[element]['value'].length) {
                // const element = ;
                array.push(replceCharecters(String(valueMapping[element]['value'][index])));
            } else {
                array.push('');
            }
        });

        // worksheetMasterDataList.push(object);
        worksheetMasterData.addRow(array);
    }
    // console.log('worksheetMasterDataList',worksheetMasterDataList);
    return rangeArray;
}

function validateHeadersOfInput(headerArray, excelData) {
    if (excelData && Array.isArray(excelData) && excelData.length != 0) {
        const excelDataHeaders = Object.keys(excelData[0]);
        let invalid = false;
        if (headerArray.length == excelDataHeaders.length) {
            let message = '';
            for (let index = 0; index < headerArray.length; index++) {
                const element = headerArray[index].header;
                // if(String(element).toLowerCase().trim() != String(excelDataHeaders[index]).toLowerCase().trim()){
                //     invalid = true;
                //     // break;
                //   if(message !=''){
                //     message = message + ',';
                //   }
                //   message = message + element;
                // }
                if (excelDataHeaders.indexOf(element) == -1) {
                    invalid = true;
                    // break;
                    if (message != '') {
                        message = message + ',';
                    }
                    message = message + element;
                }
            }
            if (invalid) {
                message = message + ' are invalid';
                return { error: true, message: message, data: [] }
            } else {
                return { error: false, message: '', data: [] }
            }
        } else {
            return { error: true, message: 'Invalid Headers', data: [] }
        }
    } else {
        return { error: true, message: 'data is empty', data: [] }
    }
}

function replceCharecters(element) {
    element = element.replaceAll("&quot", '"');
    element = element.replaceAll("&slash", "\\");
    return element;
}