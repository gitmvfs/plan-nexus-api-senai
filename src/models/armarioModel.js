module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");
  const alunoModel = require("./alunoModel")(sequelize)
  const statusArmarioModel = require("./statusArmario")(sequelize)
  

  const armarioModel = sequelize.define('armario', {

    numero: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    fk_aluno: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: alunoModel,
        key: 'id_aluno'
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