'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PaymentMethod extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PaymentMethod.init({
    payment_method_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    payment_type_id: DataTypes.INTEGER,
    logo: DataTypes.STRING,
    payment_method_name: DataTypes.STRING,
    platform_payment_method: DataTypes.ENUM,
    payment_admin_percent: DataTypes.DOUBLE,
    payment_admin_nominal: DataTypes.DOUBLE
  }, {
    sequelize,
    modelName: 'PaymentMethod',
  });
  return PaymentMethod;
};