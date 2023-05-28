'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Days', [
        {day_name: 'Senin',createdAt: new Date(),
            updatedAt: new Date()},
        {day_name: 'Selasa',createdAt: new Date(),
            updatedAt: new Date()},
        {day_name: 'Rabu',createdAt: new Date(),
            updatedAt: new Date()},
        {day_name: 'Kamis',createdAt: new Date(),
            updatedAt: new Date()},
        {day_name: 'Jumat',createdAt: new Date(),
            updatedAt: new Date()},
        {day_name: 'Sabtu',createdAt: new Date(),
            updatedAt: new Date()},
        {day_name: 'Minggu',createdAt: new Date(),
            updatedAt: new Date()}
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Days', null, {});
  }
};
