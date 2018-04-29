var express = require('express');
var router = express.Router();
var locationUserModel = require('../model/locationUser');
var userModel = require('../model/users');
var _ = require('lodash');
var middleware = require('./middleware');


// route for listing locations searched by logged in user
router.get('/locations', middleware, function (req, res, next) {

	const result = userModel.query().eager('locations.locationData').where('id', res.locals.userId).omit(['encryptedPassword', 'passwordSalt']).then(location => {
		if (_.isEmpty(location)) {
			res.status(404).json({
				success: false,
				result: 'no locations serached for this user'
			});
		}
		res.status(200).json({
			success: true,
			result: location
		});
	}).catch(error => {
		res.status(500);
		res.json({
			success: false,
			result: error
		});
	});
});

module.exports = router;
