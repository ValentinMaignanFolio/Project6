const multer = require('multer');
const MIME_TYPES = {
    'images/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'images/png': 'png'
};

// récupération du nom de l'image puis mise au formatage unique + application de l'extension défini via MIME_TYPES
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images')
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + Date.now() + '.' + extension);
    }
});

module.exports = multer({ storage: storage }).single('image');