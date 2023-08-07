const nodemailer = require('nodemailer');
const validator = require('../validator/validatormethod');

class Mail {
    constructor() {

    }
    async sendMail(options, from, to, subject, html, cc = [], bcc = [], attachment = []) {
        return new Promise(async (resolve, reject)=>{
            try {
                var body = {
                    options: options,
                    from: from, 
                    to: to, 
                    subject: subject,
                    html: html,
                    cc: cc,
                    bcc: bcc,
                    attachment: attachment
                }
                const validationRule = {
                    "options":"required",
                    "from": "required|string",
                    "to": "required|array",
                    "subject": "required",
                    "html": "required"
                }
                var valid = await validator(body, validationRule, {});
                if(valid.err){
                    return resolve({err: true, data: valid.data });
                }
                let transport = nodemailer.createTransport(options);
                const message = {
                    from: from || 'ILLUME<no-reply@bajajfinserv.in>', // Sender address
                    to: to, // List of recipients
                    subject: subject, // Subject line
                    html: '<div>' + html + '</div>', // HTML body
                };
                if(cc && Array.isArray(cc) && cc.length > 0){
                    message["cc"] = cc || [];
                }
                if(bcc && Array.isArray(bcc) && bcc.length > 0){
                    message["bcc"] = bcc || [];
                }
                if(attachment && Array.isArray(attachment) && attachment.length > 0){
                    message["attachments"] = attachment || [];
                }
                transport.sendMail(message, function (err, info) {
                    if (err) {
                        resolve({err: true, data: err});
                    } else {
                        resolve({err: false, data: info});
                    }
                });
            } catch (error) {
                resolve({err: true, data: error.message});
            }
        })
    }
}

module.exports = Mail;