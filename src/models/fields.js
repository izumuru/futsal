'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Fields extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.Gallery, {
        foreignKey: 'field_id'
      })
      this.hasMany(models.DaysActive, {
        foreignKey: 'field_id'
      })
      this.hasMany(models.Booking, {
        foreignKey: 'field_id'
      })
    }
  }
  Fields.init({
    field_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    booking_open: DataTypes.TIME,
    booking_close: DataTypes.TIME,
    waktu_mulai_malam: DataTypes.TIME,
    harga: DataTypes.DOUBLE,
    harga_malam: DataTypes.DOUBLE,
    deletedAt: 'destroyTime',
  }, {
    paranoid: true,
    sequelize,
    modelName: 'Fields',
  });
  return Fields;
};