const alunoModel = require("./alunoModel")
const statusArmarioModel = require("./statusArmario")
const { DataTypes } = require('sequelize');
const conectar_db = require("../services/conectarDB")
const sequelize = conectar_db

const armarioModel = sequelize.define('armario', {
    numero: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    fk_CPF: {
      type: DataTypes.CHAR(11),
      allowNull: true, 
      references: {
        model: alunoModel,
        key: 'CPF'
      }
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull:false,
      references:{
        model:statusArmarioModel,
        key:"id_status"
      }
    }
  }, {
    tableName: 'armario',
    timestamps: false // Se não houver colunas de timestamp
  });
  

  module.exports = armarioModel