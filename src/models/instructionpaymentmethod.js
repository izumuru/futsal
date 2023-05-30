'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class InstructionPaymentMethod extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.PaymentMethod, {
        foreignKey: 'payment_method_id'
      })
    }
  }
  InstructionPaymentMethod.init({
    instruction_payment_method_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    payment_method_id: DataTypes.INTEGER,
    type_payment_method: DataTypes.STRING,
    instruction_payment_method_description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'InstructionPaymentMethod',
  });
  return InstructionPaymentMethod;
};