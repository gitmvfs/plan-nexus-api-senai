module.exports = (sequelize) =>{
    const { DataTypes } = require("sequelize")

    const doacaoArmarioModel = sequelize.define('doacao_armario', {
        id_doa_armario: {
          type: DataTypes.INTEGER.UNSIGNED,
          primaryKey: true,
          autoIncrement: true
        },
        fk_numero: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: 'armario',
            key: 'numero'
          }
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
        tableName: 'doacao_armario',
        charset: 'utf8mb4',
        collate: 'utf8mb4_0900_ai_ci',
        timestamps: false
      });

return doacaoArmarioModel

}