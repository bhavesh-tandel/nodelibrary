const Validator = require('validatorjs');

const validatorMethod = async (body, rules, customMessages, callback) => {
    const validation = new Validator(body, rules, customMessages);

    validation.passes(() => callback(null, true));

    validation.fails(() => callback(validation.errors, false));
};

const validator = (body, validationRule, customMessages = {}) =>{
    return new Promise((r, j)=>{
        validatorMethod(body, validationRule, customMessages = {}, (err, status) => {
            if (!status) {
                return r({err: true, data:{
                    success: false,
                    message: 'Validation failed',
                    data: err
                }})
            } else {
                return r({err: false, data:{
                    success: true
                }})
            }
        }); 
    }) 
}
// module.exports = validatorM;
module.exports = validator;