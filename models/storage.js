'use strict';

var util = require('util');
var db = require('./db').getConnection();
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../config');
var Client = require('node-rest-client').Client;
var restClient = new Client();

var storageSchema = new Schema({
	memory: 		{ type: String, required: true },
	type:  			{ type: String, required: true },
	data:  			{ type: String, required: true }
});

storageSchema.statics.listAllItemsForMemory = function(memory, callback) {
	restClient.get(config.http.rest_url + "/list/" + memory,  function(data, response) {

		for (var i = data.length - 1; i >= 0; i--) {
			if(data[i].type === 'deezer') {
				if(data[i].data.indexOf('/album/') > -1) {
					var re = new RegExp('/album/(\d*)');
					data[i].data = re.exec(data[i].data)[1];
					data[i].type = 'deezer-album';
		console.log(data[i].data);
				} else if(data[i].data.indexOf('/track/') > -1) {
					var re = new RegExp('/track/(\d*)');
					data[i].data = re.exec(data[i].data)[1];
					data[i].type = 'deezer-track';
		console.log(data[i].data);
				}
			}
		};

		callback(null, data);
	}).on('error',function(err){
		callback(err);
	});
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