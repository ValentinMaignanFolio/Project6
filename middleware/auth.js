const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

// création d'une authentification appliquée à l'ensemble des routes
module.exports = async (req, res, next) => {
    try{
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.TOKEN);
        const userId = decodedToken.userId;
        if(req.body.userId && req.body.userId !== userId){
            throw 'User ID invalid';
        }else{
            next();
        }
    }catch(error){
        res.status(401).json({error:error | 'Requête non authentifiée !'});
    }
};