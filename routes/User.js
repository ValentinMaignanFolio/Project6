const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/User');

// importation des routes d'identification utilisateur

router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;