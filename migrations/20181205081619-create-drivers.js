'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('drivers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      firstName: {
        type: Sequelize.STRING
      },
      middleName: {
        type: Sequelize.STRING
      },
      lastName: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      password: {
        type: Sequelize.STRING
      },
      token: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      mobile: {
        type: Sequelize.STRING
      },
      gender: {
        type: Sequelize.STRING
      },
      plateNo: {
        type: Sequelize.STRING
      },
      currentLocation: {
        type: Sequelize.GEOMETRY('POINT')
      },
      isOnline: {
        type: Sequelize.BOOLEAN
      },
      profile: {
        type: Sequelize.STRING
      },
      hasProfile: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      isCarRegistered: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },  
      isCarVerified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },          
      status: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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
    return queryInterface.dropTable('drivers');
  }
};