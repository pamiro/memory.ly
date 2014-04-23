'use strict';

var util = require('util');
var db = require('./db').getConnection();
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Client = require('node-rest-client').Client;

var storageSchema = new Schema({
	memory: 		{ type: String, required: true },
	type:  			{ type: String, required: true },
	data:  			{ type: String, required: true }
});

storageSchema.statics.listAllItemsForMemory = function(memory, callback) {

	if(!memory) {
		throw new Error('No memory provided');
	}

	this.find({ memory: memory }, function(error, items) {
		if(error) {
			callback(error);
		} else if(items) {
			callback(null, items);
		} else {
			callback('Unknown error');
		}
	})
};

storageSchema.statics.create = function(memory, type, data, callback) {
	var newStorage = new Storage({
		memory: memory,
		type: type,
		data: data
	});
	newStorage.save(callback);
};

var Storage = db.model('Storage', storageSchema);

module.exports.Storage = Storage;