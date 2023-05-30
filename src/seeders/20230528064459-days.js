'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Days', [
        {day_id: 1, day_name: 'Senin',createdAt: new Date(),
            updatedAt: new Date()},
        {day_id: 2, day_name: 'Selasa',createdAt: new Date(),
            updatedAt: new Date()},
        {day_id: 3, day_name: 'Rabu',createdAt: new Date(),
            updatedAt: new Date()},
        {day_id: 4, day_name: 'Kamis',createdAt: new Date(),
            updatedAt: new Date()},
        {day_id: 5, day_name: 'Jumat',createdAt: new Date(),
            updatedAt: new Date()},
        {day_id: 6, day_name: 'Sabtu',createdAt: new Date(),
            updatedAt: new Date()},
        {day_id: 7, day_name: 'Minggu',createdAt: new Date(),
            updatedAt: new Date()}
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Days', null, {});
  }
};
