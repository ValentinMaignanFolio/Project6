const Sauce = require('../models/Sauce');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');


// Création POST Sauce + enregistrement de l'image dans le dossier Images
exports.createSauce = (req, res, next) => {
        const sauceObject = JSON.parse(req.body.sauce);
        console.log(sauceObject);
   
        sauceObject.dislikes = 0;
        sauceObject.likes = 0;
        sauceObject.usersDisliked = [];
        sauceObject.usersLiked = [];
        delete sauceObject._id;
        console.log(sauceObject);
        const sauce = new Sauce({
            ...sauceObject,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
            
        });
        console.log(sauce);

        // sauvegarde de la sauce créée
        sauce.save()
            .then(() => res.status(201).json({message: 'objet ajouté'}))
            .catch((error) => res.status(400).json({error}));
        console.log(sauce);
};


// Création PUT pour modification d'une sauce
exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    // sauvegarde de l'update
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id})
        .then(() => res.status(200).json({ message : 'Sauce modifié'}))
        .catch(error => res.status(400).json({error}));
};


// création DELETE de sauce pour supprimer une sauce de l'API
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id})
                    .then(() => res.status(200).json({ message : 'Sauce supprimé'}))
                    .catch(error => res.status(400).json({error}));
            })
        })
        .catch(error => res.status(500).json({error})); 
};


// création GET pour récupérer une sauce unique
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(400).json({error}));
};

// création GET pour récupérer l'ensemble des sauces
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({error}));
};

// gestion des likes et dislikes
exports.postLikes = (req, res) => {
    Sauce.findById(req.params.id).then(sauce => {
        let usersLikes = sauce.usersLiked;
        let usersDislikes = sauce.usersDisliked;

        // 3 cas : l'utilisateur aime(1), n'aime pas (-1) ou annule (0)
        switch(req.body.like){
            // si 1 l'utilisateur aime la sauce --> incrémentation de 1 de likes + ajout de l'ID user à l'array
            case 1:
                if (usersLikes.indexOf(req.body.userId) == -1){
                    usersLikes.push(req.body.userId);
                    if(usersDislikes.indexOf(req.body.userId) != -1){
                       usersDislikes.splice(usersDislikes.indexof(req.body.userId),1);
                    }

                }
                break;
            // si -1 l'utilisateur n'aime pas la sauce --> incrémentation de 1 de dislikes + ajout de l'ID user à l'array
            case -1:
                if(usersDislikes.indexOf(req.body.userId) == -1){
                   usersDislikes.push(req.body.userId);
                   if(usersLikes.indexOf(req.body.userId) != -1){
                      usersLikes.splice(usersLikes.indexOf(req.body.userId),1);
                    }
                }
                break;
            // si 0 on retire l'ID user de l'array correspondant
            case 0:
                usersLikes.indexOf(req.body.userId) != -1 ? usersLikes.splice(usersLikes.indexOf(req.body.userId),1) : console.log('');
                usersDislikes.indexOf(req.body.userId) != -1 ? usersDislikes.splice(usersDislikes.indexOf(req.body.userId),1) : console.log('');
                break;
        }
        // récupération des données modifiées
        const likes = usersLikes.length;
        const dislikes = usersDislikes.length;
        const usersLiked = usersLikes;
        const usersDisliked = usersDislikes;

        // enregistrement des nouvelles données et update de la sauce identifiée
        Sauce.updateOne({ _id: req.params.id }, {
            likes,
            dislikes,
            usersLiked,
            usersDisliked,
        }, (err, nb) => {console.log(nb)});

        res.status(200).json({message: 'listeLikeUpdatée'});
    }).catch(err => res.status(418).json({err}));
}

exports.error = (err, req, res, next) => {
    res.status(418).json({message: err});
}
