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
models.users = require('../models/users')(sequelize, Sequelize);
models.drivers = require('../models/drivers')(sequelize, Sequelize);
models.riderequests = require('../models/ride_requests')(sequelize, Sequelize);
models.payments = require('../models/payments')(sequelize, Sequelize);
models.verifications = require('../models/verifications')(sequelize, Sequelize);
models.cars = require('../models/cars')(sequelize, Sequelize);
models.ratings = require('../models/ratings')(sequelize, Sequelize);
models.admins = require('../models/admins')(sequelize, Sequelize);
models.trafics = require('../models/trafics')(sequelize, Sequelize);
models.change_passwords = require('../models/change-passwords')(sequelize, Sequelize);
models.settings = require('../models/settings')(sequelize, Sequelize);

models.riderequests.belongsTo(models.users, {
  foreignKey: 'user_id',
  targetKey: 'token'
});
models.users.hasMany(models.riderequests, {
  foreignKey: 'user_id',
  sourceKey: 'token'
});

models.riderequests.belongsTo(models.drivers, {
  foreignKey: 'driver_id',
  targetKey: 'token'
});
models.drivers.hasMany(models.riderequests, {
  foreignKey: 'driver_id',
  sourceKey: 'token'
});

models.ratings.belongsTo(models.drivers, {
  foreignKey: 'driver_id',
  targetKey: 'token'
});
models.drivers.hasMany(models.ratings, {
  foreignKey: 'driver_id',
  sourceKey: 'token'
});

models.payments.belongsTo(models.riderequests, {
  foreignKey: 'ride_id',
  targetKey: 'id'
});
models.riderequests.hasOne(models.payments, {
  foreignKey: 'ride_id',
  sourceKey: 'id'
});

models.ratings.belongsTo(models.riderequests, {
  foreignKey: 'ride_id',
  targetKey: 'id'
});
models.riderequests.hasOne(models.ratings, {
  foreignKey: 'ride_id',
  sourceKey: 'id'
});

models.payments.belongsTo(models.drivers, {
  foreignKey: 'driver_id',
  targetKey: 'token'
});
models.drivers.hasMany(models.payments, {
  foreignKey: 'driver_id',
  sourceKey: 'token'
});

models.drivers.hasMany(models.cars, {
  foreignKey: 'driver_id',
  sourceKey: 'token'
});
models.cars.belongsTo(models.drivers, {
  foreignKey: 'driver_id',
  targetKey: 'token'
});


module.exports = models;