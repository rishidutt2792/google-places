/* eslint-disable class-methods-use-this */
var Joi = require('joi');
var knexClass = require('knex');
var BaseModel = require('./base');


class Users extends BaseModel {
	static get tableName() {
		return 'users';
	}

	$afterGet(queryContext) {
		delete queryContext.encryptedPassword;
	}

	static get relationMappings() {
		return {
			locations: {
				relation: BaseModel.HasManyRelation,
				modelClass: `${__dirname}/locationUser`,
				join: {
					from: 'users.id',
					to: 'user_locations.userId'
				}
			},
		}
	}


	encryptPassword(password) {
		const salt = bcrypt.genSaltSync();
		const hash = bcrypt.hashSync(password, salt);
		return hash;
	}
}

module.exports = Users;
