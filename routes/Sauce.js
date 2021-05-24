const express = require('express');
const router = express.Router();

// importation du schéma sauce et des midllewars d'authentification et multer

const sauceCtrl = require('../controllers/Sauce');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config')

// implémentation des routes avec une application de l'authentification

router.post('/', auth, multer, sauceCtrl.createSauce);
router.post('/:id/like', auth, multer, sauceCtrl.postLikes);
router.put('/:id', auth, multer, sauceCtrl.modifySauce);
router.delete('/:id', auth, sauceCtrl.deleteSauce);
router.get('/', auth, sauceCtrl.getAllSauces);
router.get('/:id', auth, sauceCtrl.getOneSauce);
router.use(sauceCtrl.error);


module.exports = router;