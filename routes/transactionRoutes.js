const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authenticate = require('../middlewares/authenticate');
const upload = require('../middlewares/upload');

router.post('/deposit', authenticate, upload.single('proofOfPayment'), transactionController.deposit);
router.post('/withdraw', authenticate, transactionController.withdraw);

module.exports = router;