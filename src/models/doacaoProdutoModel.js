module.exports = (sequelize) =>{
    const { DataTypes } = require("sequelize")

    const doacaoProdutoModel = sequelize.define('doacao_produto', {
        id_doacao_produto: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        fk_aluno: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: 'aluno',
            key: 'id_aluno'
          }
        },
        fk_produto: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: 'produto',
            key: 'id_produto'
          }
        },
        quantidade: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        data: {
          type: DataTypes.DATEONLY,
          allowNull: false
        }
      }, {
        tableName: 'doacao_produto',
        charset: 'utf8mb4',
        collate: 'utf8mb4_0900_ai_ci',
        timestamps: false
      });



    return doacaoProdutoModel
}