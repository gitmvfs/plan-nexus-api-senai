module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize")

  const produtoModel = sequelize.define('produto', {
    id_produto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    descricao: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    foto: {
      type: DataTypes.JSON,
      allowNull: false
    },
    qtd_estoque: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    valor: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false
    },
    brinde: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    }
  }, {
    tableName: 'produto',
    timestamps: false // Se não tiver campos de created_at e updated_at
  });
  
  return produtoModel
}