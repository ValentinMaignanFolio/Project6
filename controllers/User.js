const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const CryptoJS = require('crypto-js');


// Inscription à l'API via création d'un nouvel utilisateur
exports.signup = (req, res, next) => {
    const regex = /^(([^<()[\]\\.,;:\s@\]+(\.[^<()[\]\\.,;:\s@\]+)*)|(.+))@(([[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}])|(([a-zA-Z-0-9]+.)+[a-zA-Z]{2,}))$/;

    // on vérifie que le mail et le mot de passe soit renseigné
    if(req.body.email && req.body.password){
        // vérification de l'email avec un regex --> si incorrect 'Adresse mail incorrect'
        if(!req.body.email.match(regex)){
            return res.status(400).json({message: 'Adresse mail incorrect'});   
        }
        
        // vérification de la validité du password
        // doit contenir 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spéciale et faire plus de 7 caractères
        else if (!req.body.password.match(/[0-9]/g) || 
           !req.body.password.match(/[A-Z]/g) || 
           !req.body.password.match(/[a-z]/g) || 
           !req.body.password.match(/[^a-zA-Z\d]/g) || 
            req.body.password.length < 7){
            return res.status(401).json({message: 'La sécurité du mot de passe est insuffisante'});
        }

        // cryptage de l'email avant enregistrement dans la base de données Mongo DB
        var ciphertext = CryptoJS.AES.encrypt(req.body.email, process.env.KEY).toString();
        console.log(ciphertext);
        var bytes = CryptoJS.AES.decrypt(ciphertext, process.env.KEY);
        var originalText = bytes.toString(CryptoJS.enc.Utf8);
 
        console.log(originalText); // 'my message'
        // cryptage du mot de passe avant envoi à la BD
        bcrypt.hash(req.body.password, 10)
                .then(hash => {
                const user = new User({
                    email: originalText,
                    password: hash
                });
                // on enregistre le nouvel user avec un mot de passe crypté
                user.save()
                    .then(() => res.status(201).json({ message: 'user created'}))
                    .catch(error => res.status(400).json({error}));
            })
            .catch(error => res.status(500).json({error}));
    }else{
        // erreur si l'utilisateur ne rentre pas le mot de passe ou le mail ou les deux
        return res.status(401).json({message: 'Le mot de passe et le mail sont obligatoires'}); 
    }
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

