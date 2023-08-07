const express = require('express');
const router = express.Router();

const emailRouteFunction = require('./SEScontroller');

/* /api/email/send-ses-email */
router.route('/send-ses-email').post(emailRouteFunction.sendSESEmail);

module.exports = router;