module.exports = (sequelize) => {

  const { DataTypes } = require("sequelize")

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
    ano_inicio: {
      type: DataTypes.STRING(4),
      allowNull: false
    },
    semestre_inicio: {
      type: DataTypes.ENUM(["1","2"]),
      allowNull: false
    },
    curso_duracao:{
      type: DataTypes.INTEGER,
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
    
return cursoModel
}