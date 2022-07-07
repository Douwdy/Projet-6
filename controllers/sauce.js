// Ressources Import
const Sauce = require("../models/sauce");
const fs = require('fs');

//Add new Sauce
exports.createSauce = (req, res, next) => {

	const sauceObject = JSON.parse(req.body.sauce);
	delete sauceObject._id;
	const sauce = new Sauce({
		...sauceObject,
		imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
		likes: 0,
		dislikes: 0,
	});
	sauce.save()
		.then(() => res.status(201).json({ message: 'Objet enregistré !' }))
		.catch(error => res.status(400).json({ error }));
};
//Display all Sauces
exports.getAllSauce = (req, res, next) => {
	Sauce.find().then(
		(sauce) => {
			res.status(200).json(sauce);
		}
	).catch(
		(error) => {
			res.status(400).json({
				error: error
			});
		}
	);
};

//Display Sauce by Id
exports.getOneSauce = (req, res, next) => {
	Sauce.findOne({
		_id: req.params.id,
	})
		.then((sauce) => {
			res.status(200).json(sauce);
		})
		.catch((error) => {
			res.status(404).json({
				error: error,
			});
		});
};

//Update Sauce
exports.modifySauce = (req, res, next) => {
	const sauceObject = req.file ?
		{
			...JSON.parse(req.body.sauce),
			imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
		} : { ...req.body };
	Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
		.then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
		.catch(error => res.status(400).json({ error }));
};

//Delete Sauce
exports.deleteSauce = (req, res, next) => {
	Sauce.findOne({ _id: req.params.id })
		.then(sauce => {
			const filename = sauce.imageUrl.split('/images/')[1];
			fs.unlink(`images/${filename}`, () => {
				Sauce.deleteOne({ _id: req.params.id })
					.then(() => res.status(200).json({ message: 'Sauce supprimée!' }))
					.catch(error => res.status(400).json({ error }));
			});
		})
		.catch(error => res.status(500).json({ error }));
};


//Add Like or Dislike
exports.likeDislikeSauce = (req, res, next) => {
	const like = req.body.like;

	Sauce.findOne({ _id: req.params.id })
		.then((sauce) => {
			// If User like a Sauce
			if (like === 1) { 
				Sauce.updateOne(
					{ _id: req.params.id },
					{
						$push: { usersLiked: req.body.userId }, //Add the user in the array of usersLiked
						$inc: { likes: +1 },// Increment the number of likes
					}
				)
					.then(() => res.status(200).json({ message: "Vous aimez cette Sauce" }))
					.catch(error => res.status(400).json({ error }))
			} else if (like === -1) { // If User dislike a Sauce
				Sauce.updateOne(
					{ _id: req.params.id },
					{
						$push: { usersDisliked: req.body.userId },
						$inc: { dislikes: +1 },
					}
				)
					.then(() => res.status(200).json({ message: "Vous n'aimez pas cette Sauce" }))
					.catch(error => res.status(400).json({ error }))

			} else {   
				//	If User remove his like
				if (sauce.usersLiked.indexOf(req.body.userId) !== -1) { 
					Sauce.updateOne(
						{ _id: req.params.id },
						{
							$pull: { usersLiked: req.body.userId }, // Remove the user in the array of usersLiked
							$inc: { likes: -1 }, // Decrement the number of likes
						}
					)
						.then(() => res.status(200).json({ message: "Vous n'aimez plus cette Sauce" }))
						.catch(error => res.status(400).json({ error }))
				}
				// If User remove his dislike
				else if (sauce.usersDisliked.indexOf(req.body.userId) !== -1) {
					Sauce.updateOne(
						{ _id: req.params.id },
						{
							$pull: { usersDisliked: req.body.userId }, // Remove the user in the array of usersDisliked
							$inc: { dislikes: -1 }, // Decrement the number of dislikes
						}
					)
						.then(() => res.status(200).json({ message: 'Vous aimez peut être cette Sauce maintenant' }))
						.catch(error => res.status(400).json({ error }))
				}

			}
		})
		.catch(error => res.status(400).json({ error }))

};



