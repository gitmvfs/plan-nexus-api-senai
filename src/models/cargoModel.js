const { DataTypes } = require('sequelize');
const conectar_db = require("../services/conectarDB")

const sequelize = conectar_db

const cargoModel = sequelize.define('cargo', {
  nivel_acesso: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  nome_cargo: {
    type: DataTypes.ENUM('Administração', 'Diretoria', 'Conselho'),
    allowNull: false
  }
}, {
  sequelize,
  tableName: 'cargo',
  timestamps: false,
  indexes: [
    {
      name: "PRIMARY",
      unique: true,
      using: "BTREE",
      fields: [
        { name: "nivel_acesso" },
      ]
    },
  ]
});

module.exports = cargoModel