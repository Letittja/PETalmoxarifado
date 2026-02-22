const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/auth');

// Rotas públicas
router.post('/login', authController.login);
router.post('/register', authController.register);

// Rotas protegidas
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.getProfile);

module.exports = router;
