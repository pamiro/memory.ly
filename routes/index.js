
/*
 * GET home page.
 */

var Memory = require('../models').Memory;

exports.index = function(req, res){
	res.render('index');
};

exports.create = function(req, res){
	// TODO: Create storage
	// TODO: Display
	Memory.create(function(error, memory) {
		if(error) {
			res.redirect('/');
		} else if(memory) {
			res.redirect('/' + memory.name);
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

exports.memory = function(req, res){
	// TODO: Create storage
	// TODO: Display
	Memory.create(function(error, memory) {
		if(error) {
			res.redirect('/');
		} else if(memory) {
			res.redirect('/' + memory.name);
		}
	});

};

exports.view = function(req, res){
	if(!req.params.memory) {
		res.json({ error: "Wrong call" });
	} else {
		res.render('view', { memory: req.params.memory });
	} 

	res.render('index');
};