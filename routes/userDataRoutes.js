const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController')

router.get('/messages', dataController.getAllMessages);
router.get('/messages/:id', dataController.getMessageById);
router.get('/summary', dataController.getSummary);

module.exports = router;