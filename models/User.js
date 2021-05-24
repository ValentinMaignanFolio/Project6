const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// création du schéma de données utilisateur

const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true},
    password: { type: String, required: true},
});

// vérification que l'email est unique via le package mongoose-unique-validator

userSchema.plugin(uniqueValidator);

// exportation du schéma

module.exports = mongoose.model('User', userSchema);