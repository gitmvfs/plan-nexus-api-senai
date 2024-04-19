module.exports = (sequelize) => {

  const { DataTypes } = require("sequelize")

  const alunoModel = sequelize.define('aluno', {
    id_aluno: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    CPF: {
      type: DataTypes.CHAR(11),
      allowNull: false
    },
    nome: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
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
      defaultValue: null
    },
    token: {
      type: DataTypes.STRING(255),
      defaultValue: null
    },
    senha: {
      type: DataTypes.STRING(100),
      defaultValue: null
    }
  }, {
    tableName: 'aluno',
    charset: 'utf8mb4',
    collate: 'utf8mb4_0900_ai_ci',
    timestamps: false
  });

  return alunoModel

}
