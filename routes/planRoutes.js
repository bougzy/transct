const express = require('express');
const planController = require('../controllers/PlanController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

router.get('/', authenticate, planController.getAllPlans);
// Add other plan routes here

module.exports = router;