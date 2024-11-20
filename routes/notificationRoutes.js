const express = require('express');
const notificationController = require('../controllers/notificationController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

router.get('/', authenticate, notificationController.getUserNotifications);
// Add other notification routes here

module.exports = router;