'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Bookings', {
            booking_id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            payment_method_id: {
                allowNull: false,
                type: Sequelize.INTEGER,
                reference: {
                    model: {
                        tableName: 'PaymentMethods',
                        schema: 'public',
                    },
                    key: 'payment_method_id'
                }
            },
            field_id: {
                allowNull: false,
                type: Sequelize.INTEGER,
                reference: {
                    model: {
                        tableName: 'Fields',
                        schema: 'public'
                    },
                    key: 'field_id'
                },
            },
            user_id: {
                allowNull: false,
                type: Sequelize.INTEGER,
                reference: {
                    model: {
                        tableName: 'Users',
                        schema: 'public',
                    },
                    key: 'user_id'
                }
            },
            booking_date: {
                allowNull: false,
                type: Sequelize.DATE
            },
            booking_time: {
                allowNull: false,
                type: Sequelize.TIME
            },
            total_price: {
                allowNull: false,
                type: Sequelize.DOUBLE
            },
            status_bayar: {
                allowNull: false,
                type: Sequelize.ENUM,
                values: [
                    'paid',
                    'waiting',
                    'canceled'
                ]
            },
            booking_code: {
                allowNull: false,
                type: Sequelize.STRING
            },
            day_price: {
                allowNull: true,
                type: Sequelize.DOUBLE
            },
            night_price: {
                allowNull: true,
                type: Sequelize.DOUBLE
            },
            day_price_quantity: {
                allowNull: true,
                type: Sequelize.INTEGER
            },
            night_price_quantity: {
                allowNull: true,
                type: Sequelize.INTEGER
            },
            virtual_account_code: {
                allowNull: true,
                type: Sequelize.STRING
            },
            tanggal_batas_pembayaran: {
                allowNull: true,
                type: Sequelize.DATE
            },
            tanggal_pembayaran: {
                allowNull: true,
                type: Sequelize.DATE
            },
            booking_payment_method_name: {
                allowNull: false,
                type: Sequelize.STRING
            },
            platform_booking: {
                allowNull: false,
                type: Sequelize.ENUM,
                values: [
                    'web',
                    'mobile'
                ]
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
        await queryInterface.dropTable('Bookings');
    }
};