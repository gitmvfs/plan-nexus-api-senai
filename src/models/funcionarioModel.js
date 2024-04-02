const conectarDB = require("../services/conectarDB")
const { DataTypes } = require("sequelize")
const sequelize = conectarDB

 const funcionarioModel = sequelize.define('funcionario', {
    NIF: {
      type: DataTypes.STRING(20),
      allowNull: false,
      primaryKey: true
    },
    nome: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    foto: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    senha: {
      type: DataTypes.STRING(60),
      allowNull: true
    },
    fk_nivel_acesso: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'cargo',
        key: 'nivel_acesso'
      }
    }
  }, {
    sequelize,
    tableName: 'funcionario',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "NIF" },
        ]
      },
      {
        name: "fk_nivel_acesso",
        using: "BTREE",
        fields: [
          { name: "fk_nivel_acesso" },
        ]
      },
    ]
  });

  module.exports = funcionarioModel