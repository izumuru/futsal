'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init({
    user_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    type: DataTypes.ENUM,
    thumbnail: DataTypes.TEXT,
    username: DataTypes.STRING,
    fcm_token: DataTypes.STRING,
    no_hp: DataTypes.STRING,
    alamat: DataTypes.TEXT,
    gender: DataTypes.ENUM,
    isaktif: DataTypes.BOOLEAN,
    ktp: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};