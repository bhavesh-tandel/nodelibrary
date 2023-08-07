const nodemailer = require('nodemailer');
const validator = require('../validator/validatormethod');
var fs = require('fs');
var mimemessage = require('mimemessage');
var path = require('path');

class Mail {
    constructor() {

    }
    async sendMail(options, from, to, subject, html, cc = [], bcc = [], attachment = []) {
        return new Promise(async (resolve, reject) => {
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
                    "options": "required",
                    "from": "required|string",
                    "to": "required|array",
                    "subject": "required",
                    "html": "required"
                }
                var valid = await validator(body, validationRule, {});
                if (valid.err) {
                    return resolve({ err: true, data: valid.data });
                }
                var mailContent = mimemessage.factory({ contentType: 'multipart/mixed', body: [] });

                mailContent.header('From', from || 'Edge<bhavesh@mobeserv.com>');
                mailContent.header('To', convertArrayIntoString(to, ','));
                mailContent.header('Subject', subject);

                if (cc && Array.isArray(cc) && cc.length > 0) {
                    mailContent.header('Cc', convertArrayIntoString(cc, ','));
                }
                if (bcc && Array.isArray(bcc) && bcc.length > 0) {
                    mailContent.header('Bcc', convertArrayIntoString(bcc, ','));
                }

                var alternateEntity = mimemessage.factory({
                    contentType: 'multipart/alternate',
                    body: []
                });

                var htmlEntity = mimemessage.factory({
                    contentType: 'text/html;charset=utf-8',
                    body: '   <html>  ' +
                        '   <head></head>  ' +
                        '   <body>  ' +
                        '   <div>' + html + '</div>  ' +
                        '   </body>  ' +
                        '  </html>  '
                });

                alternateEntity.body.push(htmlEntity);

                mailContent.body.push(alternateEntity);

                if (attachment && Array.isArray(attachment) && attachment.length > 0) {
                    attachment.forEach((item)=>{ 
                        if(fs.existsSync(item.path)){
                            var filename = item.filename || path.basename(item.path);
                            var data = fs.readFileSync(item.path);
                            var attachmentEntity = mimemessage.factory({
                                contentType: 'text/plain',
                                contentTransferEncoding: 'base64',
                                body: data.toString('base64').replace(/([^\0]{76})/g, "$1\n")
                            });
                            attachmentEntity.header('Content-Disposition', 'attachment ;filename="'+filename+'"');
                            mailContent.body.push(attachmentEntity);
                        }
                    })
                }

                /**
                 * AWS SES
                 */
                var AWS = require('aws-sdk');
                // Instantiate SES.
                // var ses = new aws.SES();
                AWS.config.update({ region: 'ap-south-1' });
                const ses = new AWS.SES({
                    accessKeyId: options.accessKeyId,//process.env.AWS_ACCESS_KEY,
                    secretAccessKey: options.secretAccessKey//process.env.AWS_SECRET_ACCESS_KEY
                });
                ses.sendRawEmail({
                    RawMessage: { Data: mailContent.toString() }
                }, (err, sesdata, res) => {
                    if(err){
                        resolve({ err: true, data: err });
                    } else {
                        resolve({ err: false, data: {sesdata: sesdata, res: res }});
                    }
                        
                });
            } catch (error) {
                resolve({ err: true, data: error.message });
            }
        })
    }
}
function convertArrayIntoString(list, delimiter = ',') {
    if (list && Array.isArray(list) && list.length > 0) {
        return list.join(delimiter);
    }
}

module.exports = Mail;