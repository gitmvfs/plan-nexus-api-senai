module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize")

    const reservaModel = sequelize.define('reserva', {
      id_reserva: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      fk_produto: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'produto',
          key: 'id_produto'
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
      quantidade: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: false
      },
      retirada: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: true,
          isBefore: sequelize.fn('DATE_ADD', sequelize.fn('NOW'), sequelize.literal('INTERVAL 7 DAY'))
        }
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    }, {
      tableName: 'reserva',
      timestamps: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_0900_ai_ci'
    });
  return reservaModel
  }