
/*
 * GET home page.
 */

var Memory = require('../models').Memory;
var Storage = require('../models').Storage;
var config = require('../config');

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

		Storage.listAllItemsForMemory(req.params.memory, function(error, items) {
			res.render('view', { memory: req.params.memory, items: items, server: config.http.full_host, pic_url: config.http.pic_url });
		});
	} 
};