'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      user_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      type: {
        allowNull: false,
        type: Sequelize.ENUM,
        values: [
            'admin',
            'operator',
            'customer'
        ]
      },
      thumbnail: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      username: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      fcm_token: {
        allowNull: true,
        type: Sequelize.STRING
      },
      no_hp: {
        allowNull: false,
        type: Sequelize.STRING
      },
      alamat: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      gender: {
        allowNull: true,
        type: Sequelize.ENUM,
        values: [
            'LK',
            'PR'
        ]
      },
      isaktif: {
        defaultValue: true,
        type: Sequelize.BOOLEAN
      },
      ktp: {
        allowNull: true,
        type: Sequelize.TEXT
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};