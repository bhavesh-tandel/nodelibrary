const express = require('express');
const router = express.Router();

const emailRouteFunction = require('./SMTPcontroller');

/* /api/email/send-smtp-email */
router.route('/send-smtp-email').post(emailRouteFunction.sendSMTPEmail);

module.exports = router;