require('dotenv').config();

module.exports = {
	DB_USERNAME: process.env.DB_USERNAME,
	DB_DATABASE: process.env.DB_DATABASE,
	DB_PASSWORD: process.env.DB_PASSWORD,
	DB_HOST: process.env.DB_HOST,
	PORT: process.env.PORT || 3000,
	DB_PORT: process.env.DB_PORT,
	NODE_ENV: process.env.NODE_ENV,
	JWT_SECRET: process.env.JWT_SECRET
};