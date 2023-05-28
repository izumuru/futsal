'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Booking.init({
    booking_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    payment_method_id: DataTypes.INTEGER,
    field_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    booking_date: DataTypes.DATE,
    booking_time: DataTypes.TIME,
    total_price: DataTypes.DOUBLE,
    status_bayar: DataTypes.ENUM('paid','waiting','canceled'),
    booking_code: DataTypes.STRING,
    day_price: DataTypes.DOUBLE,
    night_price: DataTypes.DOUBLE,
    admin_price: DataTypes.DOUBLE,
    day_price_quantity: DataTypes.INTEGER,
    night_price_quantity: DataTypes.INTEGER,
    virtual_account_code: DataTypes.STRING,
    tanggal_batas_pembayaran: DataTypes.DATE,
    tanggal_pembayaran: DataTypes.DATE,
    booking_payment_method_name: DataTypes.STRING,
    platform_booking: DataTypes.ENUM('web','mobile')
  }, {
    sequelize,
    modelName: 'Booking',
  });
  return Booking;
};