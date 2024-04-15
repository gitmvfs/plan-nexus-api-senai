module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize")

  const produtoModel = sequelize.define('produto', {
    id_produto: {
      type: DataTypes.INTEGER.UNSIGNED,
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
    cor: {
      type: DataTypes.STRING(25),
      allowNull: true
    },
    tamanho: {
      type: DataTypes.ENUM('PP', 'P', 'M', 'G1', 'G2', 'G3'),
      allowNull: true
    },
    valor: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false
    },
    qtd_estoque: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    qtd_reservada: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0
    },
    brinde: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    tableName: 'produto',
    timestamps: false
  });
  
  return produtoModel
}
