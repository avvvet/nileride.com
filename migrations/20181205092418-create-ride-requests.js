'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('ride_requests', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      driver_id: {
        type: Sequelize.STRING
      },
      pickup_latlng: {
        type: Sequelize.GEOMETRY('POINT')
      },
      dropoff_latlng: {
        type: Sequelize.GEOMETRY('POINT')
      },
      route_distance: {
        type: Sequelize.DECIMAL
      },
      route_time: {
        type: Sequelize.INTEGER
      },
      route_price: {
        type: Sequelize.DECIMAL
      },
      status: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('ride_requests');
  }
};