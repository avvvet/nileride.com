'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('ratings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ride_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'ride_requests',
          key: 'id'
        }
      },
      driver_id: {
        type: Sequelize.STRING,
        references: {
          model: 'drivers',
          key: 'token'
        }
      },
      rating: {
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
    return queryInterface.dropTable('ratings');
  }
};