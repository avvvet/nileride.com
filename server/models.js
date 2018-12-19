'use strict'

const Sequelize = require('sequelize');
const env = require('../env');
const sequelize = new Sequelize(env.DATABASE_NAME, env.DATABASE_USERNAME, env.DATABASE_PASSWORD, {
  host: env.DATABASE_HOST,
  dialect: env.DATABASE_DIALECT,
  operatorsAliases: env.DATABASE_OPERATORSALIASES
});

// Connect all the models/tables in the database to a db object,
//so everything is accessible via one object
const models = {};

models.Sequelize = Sequelize;
models.sequelize = sequelize;

//Models/tables
models.drivers = require('../models/drivers')(sequelize, Sequelize);
models.riderequests = require('../models/ride_requests')(sequelize, Sequelize);

models.riderequests.belongsTo(models.drivers, {
  foreignKey: 'driver_id',
  targetKey: 'token'
});
models.drivers.hasMany(models.riderequests, {
  foreignKey: 'driver_id',
  sourceKey: 'token'
});

module.exports = models;