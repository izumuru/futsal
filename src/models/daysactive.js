'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DaysActive extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Days, {
        foreignKey: 'day_id'
      })
      this.belongsTo(models.Fields, {
        foreignKey: 'field_id'
      })
    }
  }
  DaysActive.init({
    days_active_id: {
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER
    },
    day_id: DataTypes.INTEGER,
    field_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'DaysActive',
  });
  return DaysActive;
};