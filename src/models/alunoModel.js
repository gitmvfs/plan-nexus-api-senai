const conectarDB = require("../services/conectarDB")
const { DataTypes } = require("sequelize")
const sequelize = conectarDB

const alunoModel = sequelize.define('aluno', {
  CPF: {
    type: DataTypes.CHAR(11),
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
  fk_curso: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'curso',
      key: 'id_curso'
    }
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
  }
}, {
  sequelize,
  tableName: 'aluno',
  timestamps: false,
  indexes: [
    {
      name: "PRIMARY",
      unique: true,
      using: "BTREE",
      fields: [
        { name: "CPF" },
      ]
    },
    {
      name: "fk_curso",
      using: "BTREE",
      fields: [
        { name: "fk_curso" },
      ]
    },
  ]
});

module.exports = alunoModel
