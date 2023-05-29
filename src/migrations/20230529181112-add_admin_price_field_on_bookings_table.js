'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return Promise.all([queryInterface.addColumn(
            'Bookings', // table name
            'admin_price', // new field name
            {
                type: Sequelize.DOUBLE,
                allowNull: true,
            },
        )])
    },

    async down(queryInterface, Sequelize) {
        return Promise.all([queryInterface.removeColumn(
            'Bookings',
            'admin_price',
        )])
    }
};
