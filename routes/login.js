var express = require('express');
var router = express.Router();
var UsersModel = require('../model/users');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var Uuid = require('node-uuid');
var _ = require("lodash");
var middleware = require('./middleware');
var config = require('../config');


var jwtOptions = {};
jwtOptions.secretOrKey = config.jwtSalt;

// route for signup
router.post('/', function (req, res, next) {

	// validation code to check request
	req.checkBody("userName", "Enter a userName.").notEmpty();
	req.checkBody("password", "Enter a password").notEmpty();

	var errors = req.validationErrors();
	if (errors) {
		res.status(400).json({
			success: false,
			result: errors
		});
	} else {
		const userExists = UsersModel.query().where('userName', req.body.userName).then(user => {
			if (_.isEmpty(user)) {
				res.status(500);
				res.json({
					success: false,
					result: 'user not registered'
				});
			} else {
				const salt = bcrypt.genSaltSync();
				const hash = bcrypt.compareSync(req.body.password, user[0].encryptedPassword);
				if (!hash) {
					res.json({
						success: false,
						result: 'password does not match'
					});
				} else {
					const sessionId = Uuid.v4();
					const payload = {
						id: user[0].id,
						sessionId: sessionId
					};
					const token = jwt.sign(payload, jwtOptions.secretOrKey);
					user[0].token = token;
					delete user[0].encryptedPassword;
					delete user[0].passwordSalt;
					res.json({
						sucess: true,
						result: user[0]
					});
				}
			}
		});
	}
});


module.exports = router;
