var knexClass = require('knex');
var Logger = require('winston');
var Config = require('../knexfile');


const Model = require('objection').Model;

const dbConfig = Config.production;
const knex = knexClass(dbConfig);
Model.knex(knex);

/**
Base model for database.
*/
class BaseModel extends Model {
	static validatorRules() {
		return {};
	}
}

module.exports = BaseModel;
