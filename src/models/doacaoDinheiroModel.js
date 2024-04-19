module.exports = (sequelize) =>{
    const { DataTypes } = require("sequelize")

    const doacaoDinheiroModel = sequelize.define('doacao_dinheiro', {
        id_doacao_dinheiro: {
          type: DataTypes.INTEGER.UNSIGNED,
          primaryKey: true,
          autoIncrement: true
        },
        quantia: {
          type: DataTypes.DECIMAL(5, 2),
          allowNull: false
        },
        fk_aluno: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: 'aluno',
            key: 'id_aluno'
          }
        },
        data: {
          type: DataTypes.DATEONLY,
          allowNull: false
        }
      }, {
        tableName: 'doacao_dinheiro',
        charset: 'utf8mb4',
        collate: 'utf8mb4_0900_ai_ci',
        timestamps: false
      });

    return doacaoDinheiroModel
}