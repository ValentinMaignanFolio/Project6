const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const dotenv = require('dotenv');
dotenv.config();


// Inscription à l'API via création d'un nouvel utilisateur
exports.signup = (req, res, next) => {
    const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    // vérification de l'email avec un regex --> si incorrect 'Adresse mail incorrect'
    if(!req.body.email.match(regex)){
        return res.status(401).json({message: 'Adresse mail incorrect'});   
    }
    // vérification de la longeur du password avec un minimum de 7 caractères
    if(req.body.password.length < 7 || req.body.password.length > 25){
        return res.status(401).json({message: 'Le mot de passe choisi est trop court. Doit contenir au moins 7 caractères'});
    }
    // cryptage du mot de passe avant envoi à la BD
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            // on enregistre le nouvel user avec un mot de passe crypté
            user.save()
                .then(() => res.status(201).json({ message: 'user created'}))
                .catch(error => res.status(400).json({error}));
        })
        .catch(error => res.status(500).json({error}));
};

// connexion de l'utilisateur
exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email})
        .then(user => {
            if(!user){
                return res.status(401).json({error: 'user not registered'});
            }
            // vérification du password via une comparaison du mot de passe rentré au mot de passe rattaché à l'utilisateur
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if(!valid){
                        return res.status(401).json({error: 'incorrect password'});
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            // récupération du token dans le fichier .env
                              process.env.TOKEN,
                            { expiresIn: '2h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({error}));
        })
        .catch(error => res.status(500).json({error}));
};

