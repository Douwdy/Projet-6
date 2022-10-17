// Ressources Import
const multer = require('multer');

const MIME_TYPES = {
	'image/jpg': 'jpg',
	'image/jpeg': 'jpg',
	'image/png': 'png'
};

//Image upload
const storage = multer.diskStorage({
	destination: (callback) => {
		callback(null, 'images');
	},
	filename: (file, callback) => {
		const name = file.originalname.split(' ').join('_');
		const extension = MIME_TYPES[file.mimetype];
		callback(null, name + Date.now() + '.' + extension);
	}
});

module.exports = multer({ storage: storage }).single('image');