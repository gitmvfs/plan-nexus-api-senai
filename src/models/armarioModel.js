module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');
  const alunoModel = require("./alunoModel")(sequelize)
  const statusArmarioModel = require("./statusArmario")(sequelize)
  

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
      allowNull: false,
      references: {
        model: statusArmarioModel,
        key: "id_status"
      }
    }
  }, {
    tableName: 'armario',
    timestamps: false // Se não houver colunas de timestamp
  });

  return armarioModel

}