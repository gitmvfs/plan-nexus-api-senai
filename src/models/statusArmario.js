const { DataTypes } = require('sequelize');
const conectar_db = require("../services/conectarDB")
const sequelize = conectar_db

const statusArmarioModel = sequelize.define('status', {
    id_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    status: {
        type: DataTypes.ENUM('Ocupado', 'Desocupado', 'Trancado'),
        defaultValue: 'Desocupado' // Defina o valor padrão se necessário
    }
}, {
    tableName: 'status',
    timestamps: false // Se não houver colunas de timestamp
});

module.exports = statusArmarioModel