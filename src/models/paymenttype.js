'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PaymentType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.PaymentMethod, {
        foreignKey: 'payment_types_id'
      })
    }
  }
  PaymentType.init({
    payment_type_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    payment_type_name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'PaymentType',
  });
  return PaymentType;
};