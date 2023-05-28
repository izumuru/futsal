'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PaymentMethods', {
      payment_method_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      payment_types_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        reference: {
          model: {
            tableName: 'PaymentTypes',
            schema: 'public',
          },
          key: 'payment_type_id'
        }
      },
      logo: {
        allowNull: false,
        type: Sequelize.STRING
      },
      payment_method_name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      platform_payment_method: {
        allowNull: false,
        type: Sequelize.ENUM
      },
      payment_admin_percent: {
        allowNull: false,
        type: Sequelize.DOUBLE
      },
      payment_admin_nominal: {
        allowNull: false,
        type: Sequelize.DOUBLE
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
    await queryInterface.dropTable('PaymentMethods');
  }
};