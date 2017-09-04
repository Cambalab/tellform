'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('../errors.server.controller.js'),
	mongoose = require('mongoose');

/**
 * Update user details
 */
exports.update = function(req, res) {
	// Init Variables
	var user = req.user;

	// For security measurement we remove the roles from the req.body object
	delete req.body.roles;

	var cleanBody = {};
	// To be safe from overwritting important data with null values, we clean the request body.
	for (var key in req.body){
		console.log(key + " is " + req.body[key]);
		if(req.body[key] !== null){
			cleanBody[key] = req.body[key];
		}
	}

	if (user) {
		// Merge existing user
		// the body of the request contains null properties that end up overwriting important data on the db
		// i.e.: null passwordHash ends up overwriting valid passwordHash and thus not allowing the user to log in.
		user = _.extend(user, cleanBody); 
		user.updated = Date.now();

		user.save(function(err) {
			if (err) {
				return res.status(500).send({
					message: errorHandler.getErrorMessage(err)
				});
			} 
			req.login(user, function(loginErr) {
				if (err) {
					res.status(500).send(loginErr);
				} else {
					res.json(user);
				}
			});
			
		});
	} else {
		res.status(401).send({
			message: 'User is not signed in'
		});
	}
};

/**
 * Send User
 */
exports.getUser = function(req, res) {
	var _user = req.user;
	delete _user.password;
	delete _user.salt;
	delete _user.provider;
	delete _user.__v;

	res.json(req.user || null);

	res.end();
};
