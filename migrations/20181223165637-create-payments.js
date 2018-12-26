'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('payments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      pay_type: {
        type: Sequelize.INTEGER
      },
      driver_id: {
        type: Sequelize.STRING,
        references: {
          model: 'drivers',
          key: 'token'
        }
      },
      ride_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'ride_requests',
          key: 'id'
        }
      },
      amount: {
        type: Sequelize.DECIMAL(10,2)
      },
      charge_dr: {
        type: Sequelize.DECIMAL(10,2)
      },
      charge_cr: {
        type: Sequelize.DECIMAL(10,2)
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
    return queryInterface.dropTable('payments');
  }
};