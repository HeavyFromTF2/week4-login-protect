/**
 * Auth Router.
 * Maps /auth endpoints to authController functions.
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/signup', authController.signUp);
router.post('/login', authController.login);

module.exports = router;