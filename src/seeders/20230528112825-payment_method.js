'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.bulkInsert('PaymentMethods', [
            {
                payment_method_id: 1,
                payment_types_id: 1,
                logo: 'bca.png',
                payment_method_name: "BCA",
                payment_admin_nominal: 4000,
                platform_payment_method: "mobile",
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                payment_method_id: 2,
                payment_types_id: 1,
                logo: 'bri.png',
                payment_method_name: "BRI",
                payment_admin_nominal: 4000,
                platform_payment_method: "mobile",
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                payment_method_id: 4,
                payment_types_id: 1,
                logo: 'bni.png',
                payment_method_name: "BNI",
                payment_admin_nominal: 4000,
                platform_payment_method: "mobile",
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                payment_method_id: 5,
                payment_types_id: 2,
                logo: 'alfamart.png',
                payment_method_name: "Alfamart",
                payment_admin_nominal: 5000,
                platform_payment_method: "mobile",
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                payment_method_id: 6,
                payment_types_id: 3,
                logo: '',
                payment_method_name: "Cash",
                platform_payment_method: "web",
                createdAt: new Date(),
                updatedAt: new Date()
            },
        ]);
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.bulkDelete('PaymentMethods', null, {});
    }
};
