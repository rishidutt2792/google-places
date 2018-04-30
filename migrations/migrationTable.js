var Bcrypt = require('bcrypt');

exports.up = function (knex, Promise) {
  return Promise.all([

    // user table
    knex.schema.createTableIfNotExists('users', (table) => {
      table.increments('id').index().primary();
      // Email
      table.string('userName', 255).unique().notNullable().comment('Name');
      table.string('encryptedPassword').notNullable().comment('user_password');
      table.string('passwordSalt').notNullable().comment('passwordSalt');
      table.boolean('isAdmin').defaultTo(false).notNullable().comment('true or false');
      table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updatedAt').notNullable().defaultTo(knex.fn.now());
    }).then(() => {
      console.log('Created Table: users table');
    }),

    // location table
    knex.schema.createTableIfNotExists('locations', (table) => {
      table.increments('id').index().primary();
      table.string('googleLocationId').unique().comment('google location id');
      table.string('placeId').index().unique().comment('place_id provided by google');
      table.string('name').unique().notNullable().comment('name');
      table.string('address').comment('address');
      table.string('icon').comment('icon url of location');
      table.float('latitude').unique().index().comment('lat of location');
      table.float('longitude').unique().index().comment('longitude of location');
      table.text('locationType').comment('pass this with json_stringfy to save an array of types');
      table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now());

      table.timestamp('updatedAt').notNullable().defaultTo(knex.fn.now());
    }).then(() => {
      console.log('Created Table: locations table');
    }),

    // user_locations table
    knex.schema.createTableIfNotExists('user_locations', (table) => {
      table.increments('id').primary();
      table.integer('userId').notNullable().references('users.id').comment('User table id');
      table.date('date').comment('date of search');
      table.integer('locationId').notNullable().references('locations.id').comment('User table id');
      table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updatedAt').notNullable().defaultTo(knex.fn.now());
    }).then(() => {
      console.log('Created Table: user_locations table');
    })
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.raw('drop table if exists user_locations cascade'),
    knex.raw('drop table if exists users cascade'),
    knex.raw('drop table if exists locations cascade')
  ]).then((values) => {
    console.log('dropped all tables : ', values);
  }, (reason) => {
    console.log('failed to rollback db : ', reason);
  });
};
