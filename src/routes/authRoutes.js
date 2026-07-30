/**
 * Auth Router.
 * Maps /auth endpoints to authController functions.
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middlewares/authMiddleware');

router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.post('/logout',authController.logout);

module.exports = router;