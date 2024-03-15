const { DataTypes} = require('sequelize');
const conectar_db = require("../utils/conectarDb")

const sequelize = conectar_db

const cursoModel = sequelize.define('curso', {
  id_curso: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  data_inicio: {
    type: DataTypes.DATE,
    allowNull: false
  },
  data_termino: {
    type: DataTypes.DATE,
    allowNull: false
  },
  modalidade:{
    type:DataTypes.STRING(255),
    allowNull: false
  }
}, {
  timestamps: false,
  tableName: 'curso'
});

module.exports = cursoModel