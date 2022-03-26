const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController')

router.get('/webhook', verificationController.verifyToken);
router.post('/webhook', verificationController.processRequest);

module.exports = router;