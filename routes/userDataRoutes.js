const express = require('express');
const router = express.Router();
const dataController = require('../controllers/userDataController')

router.get('/messages', dataController.getAllMessages);
router.get('/messages/:id', dataController.getMessageById);
router.get('/summary', dataController.getSummary);

module.exports = router;