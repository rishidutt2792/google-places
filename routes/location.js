var express = require('express');
var router = express.Router();
var middleware = require('./middleware');
var adminMiddleware = require('./adminMiddleware');
var config = require('../config');
var request = require('request');
var logger = require('winston');
var locationModel = require('../model/locations');
var userModel = require('../model/users');
var locationUserModel = require('../model/locationUser');
var _ = require('lodash');
var knexClass = require('knex');
var Config = require('../knexfile');
const dbConfig = Config.development;
const knex = knexClass(dbConfig);



const validator = locationUserModel.validatorRules();

// search for any place by string ex- hotels near mumbai
router.get('/', middleware, function (req, res, next) {
	// validation code
	req.checkQuery("places", "Pass places and value in url params").notEmpty();
	var errors = req.validationErrors();
	if (errors) {
		res.status(400).json({
			success: false,
			result: errors
		});
	} else {
		request('https://maps.googleapis.com/maps/api/place/textsearch/json?query=' + req.query.places + '&key=' + config.googleApiKey, function (error, response, body) {
			if (body.status === "ZERO_RESULTS") {
				return res.status(404).json({
					success: false,
					result: 'no place found'
				});
			}
			return res.status(200).send(
				body
			);
		})
	}
});

// search for location based on placeId
router.get('/:placeId/details', function (req, res, next) {
	// validation code
	req.checkParams("placeId", "Pass placeId and value in url params").notEmpty();
	var errors = req.validationErrors();
	if (errors) {
		res.status(400).json({
			success: false,
			result: errors
		});
	} else {
		request('https://maps.googleapis.com/maps/api/place/details/json?placeid=' + req.params.placeId + '&key=' + config.googleApiKey, function (error, response, body) {
			if (_.isEmpty(body)) {
				res.status(404).json({
					success: false,
					result: 'no place found'
				});
			}
			return res.status(200).send(
				body
			);
		})
	}
});


// route to create location and user_location data 
router.post('/create', middleware, function (req, res, next) {

	// validation code
	req.checkBody("googleLocationId", "Enter a valid string").notEmpty();
	req.checkBody("placeId", "Enter a placeId.").notEmpty();
	req.checkBody("name", "Enter a name.").notEmpty();
	req.checkBody("address", "Enter a address.").notEmpty();
	req.checkBody("latitude", "Enter a latitude").notEmpty();
	req.checkBody("longitude", "Enter a longitude").notEmpty();
	req.checkBody("locationType", "Enter a valid locationType").notEmpty();
	var errors = req.validationErrors();
	if (errors) {
		res.status(400).json({
			success: false,
			result: errors
		});
	} else {

		const result = locationModel.query().insert(req.body).then(location => {

			// update user_location table 

			const body = {
				userId: res.locals.userId,
				locationId: location.id,
				date: new Date()
			}
			const userLocation = locationUserModel.query().insert(body).then(result => {
				res.status(200).json({
					success: true,
					result: location
				});
			}).catch(error => {
				res.status(500).json({
					success: false,
					result: result
				});
			})
		}).catch(error => {
			res.status(500);
			res.json({
				success: false,
				result: error
			});
		});
	}

});



// serach users for a paticular location only admin has access to this route
router.get('/:id/users', adminMiddleware, function (req, res, next) {
	const result = locationModel.query().eager('locationUser.user').where('id', req.params.id).omit(['encryptedPassword', 'passwordSalt']).then(user => {
		if (_.isEmpty(user)) {
			res.status(404).json({
				success: false,
				result: 'no user for this location'
			});
		}
		res.status(200).json({
			success: true,
			result: user
		});
	}).catch(error => {
		res.status(500).json({
			success: false,
			result: error
		});
	});
});

// route for most or least searched place date is optional only admin has access to this route
router.get('/search', adminMiddleware, function (req, res, next) {
	req.checkQuery("query", "Query for most or least serached place allowed values most or least").isIn(['most', 'least']).notEmpty();

	var errors = req.validationErrors();
	if (errors) {
		res.status(400).json({
			success: false,
			result: errors
		});
	} else {
		if (req.query.date) {
			var sql = locationUserModel.query().select(locationModel.raw('count(*) as count, "locationId"')).where('date', req.query.date).groupBy('locationId').orderBy('count', 'desc');
		} else {
			var sql = locationUserModel.query().select(locationModel.raw('count(*) as count, "locationId"')).groupBy('locationId').orderBy('count', 'desc');
		}
		const result = sql.then(locationUserData => {
			if (_.isEmpty(locationUserData)) {
				res.status(404).json({
					success: false,
					result: 'none'
				});
			}
			// set array of id so that serch can be done without foreach
			var mostSearchedIdarr = [];
			var LeastSearchedIdarr = [];
			// query is ordered by so the first element will be max and last will be least
			var maxcount = locationUserData[0].count;
			var leastCount = locationUserData[locationUserData.length - 1].count;

			// filter function to push id into max or least array
			_.filter(locationUserData, function (location) {
				if (location.count === maxcount) {
					mostSearchedIdarr.push(location.locationId)
				}
				if (location.count === leastCount) {
					LeastSearchedIdarr.push(location.locationId)
				}
			});


			var locationIdarray = mostSearchedIdarr;
			if (req.query.query === 'least') {
				locationIdarray = LeastSearchedIdarr;
			}
			const location = locationModel.query().whereIn('id', locationIdarray).then(locations => {
				res.status(200).json({
					success: true,
					result: locations
				});
			})
		}).catch(error => {
			res.status(500).json({
				success: false,
				result: error
			});
		});
	}
});

// route  retrive users for a paticular type of location only admin has access
router.get('/type/user', adminMiddleware, function (req, res, next) {
	req.checkQuery("type", "Get users  for a paticular type of location").notEmpty();

	const result = knex.raw(
			`SELECT users."userName",locations.id,locations."placeId",locations."locationType",locations."googleLocationId",locations.address,user_locations.date,user_locations."locationId",user_locations."userId" FROM locations left join user_locations on locations.id = user_locations."locationId" left join users on
 user_locations."userId" = users.id   WHERE '${req.query.type}' = ANY ("locationType") 
 `)
		.then(data => {
			if (_.isEmpty(data)) {
				res.status(404).json({
					success: false,
					result: 'no user for this location'
				});
			}
			res.status(200).json({
				success: true,
				result: user.rows
			});
		}).catch(error => {
			res.status(500).json({
				success: false,
				result: error
			});
		});
});

module.exports = router;
