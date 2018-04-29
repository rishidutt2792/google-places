/* eslint-disable class-methods-use-this */
var Joi = require('joi');
var knexClass = require('knex');
var BaseModel = require('./base');


class Locations extends BaseModel {
	static get tableName() {
		return 'locations';
	}
	static get relationMappings() {
		const date = new Date();
		return {
			locationUser: {
				relation: BaseModel.HasManyRelation,
				modelClass: `${__dirname}/locationUser`,
				join: {
					from: 'locations.id',
					to: 'user_locations.locationId'
				}
			},

		}
	}

}

module.exports = Locations;
