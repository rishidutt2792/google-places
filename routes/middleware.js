// get an instance of the router for api routes

// route to authenticate a user (POST http://localhost:8080/api/authenticate)
var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var UsersModel = require('../model/users');
var config = require('../config');
var _ = require('lodash');
var app = express();



// route middleware to verify a token
module.exports = function (req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.headers['x-access-token']

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, config.jwtSalt, function (err, decoded) {
      if (err) {
        return res.status(401).json({
          success: false,
          message: 'Failed to authenticate token.'
        });
      } else {
        const userExists = UsersModel.query().where('id', decoded.id).then(function (response) {
          if (_.isEmpty(response)) {
            return res.status(401).send({
              success: false,
              message: 'user not found failed to authenticate token.'
            });
          }
          // if everything is good, save to request for use in other routes
          res.locals.userId = response[0].id;
          next();
        });
      }
    });
  } else {
    // if there is no token
    // return an error
    return res.status(403).send({
      success: false,
      message: 'No token provided.'
    });
  }
};


//module.exports = router;
