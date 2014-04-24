
/*
 * GET home page.
 */

var Memory = require('../models').Memory;
var Storage = require('../models').Storage;
var config = require('../config');
var Client = require('node-rest-client').Client;
var restClient = new Client();

exports.index = function(req, res){
	res.render('index');
};

exports.terms = function(req, res){
	res.render('terms');
};

exports.demo = function(req, res){
	res.render('demo');
};

exports.postDemo = function(req, res){
	Storage.create(req.body.memory, req.body.type, req.body.data, function(error, item) {
		if(error) {
			res.json({ error: error });
		} else if(item) {
			res.redirect('/' + req.body.memory);
		}
	});

};

exports.create = function(req, res){
	// TODO: Create storage
	// TODO: Display
	Memory.create(req.body.memory, function(error, memory) {
		if(error) {
			res.redirect('/');
		} else if(memory) {
			res.render('success', { name: memory.name });
		}
	});

};

exports.art = function(req, res) {
	if(req.params.type === 'track') {
		restClient.get('http://api.deezer.com/track/' + req.params.id.trim(),  function(data, response) {
			data = JSON.parse(data);
			res.json( { art: data.album.cover + "?size=big", name: data.title, artist: data.artist.name  } );
		}).on('error',function(err){
			res.json({ });
		});
	} else if(req.params.type === 'album') {
		restClient.get('http://api.deezer.com/album/' + req.params.id.trim(),  function(data, response) {
			data = JSON.parse(data);
			res.json( { art: data.cover + "?size=big", name: data.title, arist: data.artist.name } );
		}).on('error',function(err){
			res.json({ });
		});
	}
}

exports.list = function(req, res) {
	Memory.listAll(function(error, memories) {
		if(error) {
			res.redirect('/');
		} else if(memories) {
			res.render('list', { memories: memories });
		}
	});
}

exports.view = function(req, res){
	if(!req.params.memory) {
		res.json({ error: "Wrong call" });
	} else {
		res.render('view', { pullTimestamp: 'first', memory: req.params.memory, server: config.http.full_host, pic_url: config.http.pic_url });
	} 
};

exports.viewData = function(req, res){
	if(!req.params.memory) {
		res.json({ error: "Wrong call" });
	} else {

		if(req.query.lastPull !== 'first') {
			res.send('');
			return;
		}

		Storage.listAllItemsForMemory(req.params.memory, req.query.lastPull, function(error, items) {
			res.render('data', { items: items });
		});
	} 
};