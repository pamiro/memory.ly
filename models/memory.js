'use strict';

var util = require('util');
var db = require('./db').getConnection();
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var randomstring = require("randomstring");

var memorySchema = new Schema({
	name: 			{ type: String, required: true },
	admin:  		{ type: String, required: true }
});

memorySchema.statics.create = function(memoryName, callback) {

	if(!memoryName) {
		memoryName = randomstring.generate(7);
	}

	var adminKey = randomstring.generate();

	this.findOne({ name: new RegExp('^'+memoryName+'$', "i") }, function(error, memory) {
		if(error) {
			callback(error);
		} else if(!memory) {
			var newMemory = new Memory({
				name: memoryName,
				admin: adminKey
			});
			newMemory.save(callback);
		} else {
			callback('This memory already exists');
		}
	})
};

memorySchema.statics.listAll = function(callback) {

	this.find({ }, function(error, memories) {
		if(error) {
			callback(error);
		} else if(memories) {
			callback(null, memories);
		} else {
			callback('Unknown error');
		}
	})
};

var Memory = db.model('Memory', memorySchema);

module.exports.Memory = Memory;