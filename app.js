// appel des packages
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const sanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const helmet = require('helmet');

const sauceRoutes = require('./routes/Sauce');
const userRoutes = require('./routes/User');
const expressMongoSanitize = require('express-mongo-sanitize');

mongoose.connect('mongodb+srv://' + process.env.DB_USERNAME + ':' + process.env.DB_PASSWORD + '@cluster0.rprca.mongodb.net/' + process.env.DB_COLLECTION + '?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

// headers et définition des requêtes possibles
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(helmet());
app.use(express.json({limit: "100mb"}));
app.use(sanitize({replaceWith: '_'}));
app.use(xss());
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/sauces', sauceRoutes);

module.exports = app;