// Ressources Import
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');

const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce')
const path = require("path");
const helmet = require('helmet');

// Environnement variables
require("dotenv").config();

const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_CLUSTER = process.env.DB_CLUSTER;
const DB_NAME = process.env.DB_NAME;

// Connection to MongoDB

mongoose.connect(`mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@${DB_CLUSTER}.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`,
	{
		useNewUrlParser: true,
		useUnifiedTopology: true
	})
	.then(() => console.log('Connexion à MongoDB réussie !'))
	.catch(() => console.log('Connexion à MongoDB échouée !'));


const app = express();


// Express Rate Limit
const LimitOfAttempts = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes delay
  max: 100, // Limit each IP to 100 requests per windowMs.
  standardHeaders: true, 
  legacyHeaders: false, 
});


app.use(express.json());
app.use(LimitOfAttempts);
app.use('/images', express.static(path.join(__dirname, 'images')));


// Cors Policy
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
	next();
});

// HTTP Headers Policy
app.use(helmet());

// Paths middleware
app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);


module.exports = app;