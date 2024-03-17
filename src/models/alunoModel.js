const { DataTypes} = require('sequelize');
const conectar_db = require("../services/conectarDB")
const cursoModel = require("./cursoModel") // Referencia para o relacionamento

const sequelize = conectar_db

const alunoModel = sequelize.define('aluno', {
    CPF: {
      type: DataTypes.CHAR(11),
      primaryKey: true
    },
    nome: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100)
    },
    fk_curso: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: cursoModel,
        key: 'id_curso'
      }
    },
    foto: {
      type: DataTypes.STRING(255)
    },
    token: {
      type: DataTypes.STRING(255)
    },
    senha: {
      type: DataTypes.STRING(60)
    }
  }, {
    timestamps: false,
    tableName: 'aluno'
  });
  
module.exports = alunoModel
