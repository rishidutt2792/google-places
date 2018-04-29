var express = require('express');
var router = express.Router();
var UsersModel = require('../model/users');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var config = require('../config');
var Uuid = require('node-uuid');


var jwtOptions = {};
jwtOptions.secretOrKey = config.jwtSalt;

// route for signup
router.post('/', function (req, res, next) {

	req.checkBody("userName", "Enter a userName.").notEmpty();

	req.checkBody("password", "Enter a password").notEmpty();

	var errors = req.validationErrors();
	if (errors) {
		res.status(400).json({
			success: false,
			result: errors
		});
	} else {
		const userExists = UsersModel.query().where('userName', req.body.userName).then(function (response) {
			if (response != '') {
				res.status(400);
				res.json({
					success: false,
					result: 'user already registered'
				});
			}
		});
		const usrObj = {
			'userName': req.body.userName,
			'password': req.body.password
		};
		const salt = bcrypt.genSaltSync();
		const hash = bcrypt.hashSync(usrObj.password, salt);
		delete usrObj.password;
		usrObj.encryptedPassword = hash;
		usrObj.passwordSalt = salt

		const result = UsersModel.query().insert(usrObj).then(user => {
			const sessionId = Uuid.v4();
			const payload = {
				id: user.id,
				sessionId: sessionId
			};
			const token = jwt.sign(payload, jwtOptions.secretOrKey);
			user.token = token
			delete user.encryptedPassword;
			delete user.passwordSalt;
			res.status(201).json({
				success: true,
				result: user
			});
		}).catch(e => {
			res.status(500).json({
				success: false,
				result: user
			});
		});
	}
});

module.exports = router;
