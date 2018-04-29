/* eslint-disable class-methods-use-this */
var Joi = require('joi');
var knexClass = require('knex');
var BaseModel = require('./base');


class locationUser extends BaseModel {
	static get tableName() {
		return 'user_locations';
	}


	static get relationMappings() {
		return {
			user: {
				relation: BaseModel.BelongsToOneRelation,
				modelClass: `${__dirname}/users`,
				join: {
					from: 'user_locations.userId',
					to: 'users.id'
				}
			},
			locationData: {
				relation: BaseModel.BelongsToOneRelation,
				modelClass: `${__dirname}/locations`,
				join: {
					from: 'user_locations.locationId',
					to: 'locations.id'
				}
			},
		}
	}
}

module.exports = locationUser;
