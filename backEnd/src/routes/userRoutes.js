const express = require('express');
const { getUser } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/me', authMiddleware, getUser);

module.exports = router;
