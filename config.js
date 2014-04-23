var config = {};
config.mongodb = {};
config.http = {};

config.mongodb.host = process.env.MONGO_HOST || '127.0.0.1';
config.mongodb.port = process.env.MONGO_PORT || 27017;
config.mongodb.user = process.env.MONGO_USER || '';
config.mongodb.password = process.env.MONGO_PASSWORD || '';
config.mongodb.database = process.env.MONGO_DATABASE || 'memoryly';

config.mongodb.uri = "mongodb://"
if(config.mongodb.user.length && config.mongodb.password.length)
	config.mongodb.uri += config.mongodb.user + ":" + config.mongodb.password + "@";
config.mongodb.uri += config.mongodb.host;
if(config.mongodb.port.toString().length)
	config.mongodb.uri += ":" + config.mongodb.port.toString();
if(config.mongodb.database.length)
	config.mongodb.uri += "/" + config.mongodb.database;

config.http.port = process.env.PORT || 3000;
config.http.cookie_secret = process.env.HTTP_COOKIE_SECRET || 'YOUR COOKIE SECRET';

module.exports = config;