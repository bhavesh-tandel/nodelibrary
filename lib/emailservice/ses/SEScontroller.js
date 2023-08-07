const emailHelperClass = require('./SESHelper');
var emailHelper = new emailHelperClass();

exports.sendSESEmail = async (req, res, next) => {
    /* 	#swagger.tags = ['Email Notification']
        #swagger.description = 'API to send emails using AWS SES' 
        #swagger.parameters['obj'] = {
            in: 'body',
            description: 'API to send AWS SES Emails',
            required: true,
            schema: { $ref: "#/definitions/SESEmailOptions" }
    }
    */
    try {
        var { options, from, to, subject, html, cc, bcc, attachment } = req.body;
        var { err, data } = await emailHelper.sendMail(options, from, to, subject, html, cc, bcc, attachment);
        if(err){
            /* #swagger.responses[500] = {
                description: 'Unable to sent email'
            } */
            return res.status(500).json({ type: false, data: err.message });
        } else {
            /* #swagger.responses[200] = {
                description: 'Email sent successfully'
            } */
            return res.status(200).json({ type: true, data: data})
        }
    } catch (error) {
        /* #swagger.responses[500] = {
                description: 'Unable to sent email'
            } */
        return res.status(500).json({ type: false, data: error.message });
    }
}