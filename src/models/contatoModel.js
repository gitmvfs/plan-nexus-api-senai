module.exports = (sequelize) => {

    const { DataTypes } = require('sequelize');

    const contatoModel = sequelize.define('contato', {
        id_contato: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        numero: {
            type: DataTypes.STRING(11),
            allowNull: false
        },
        tipo: {
            type: DataTypes.ENUM('telefone fixo', 'telefone celular'),
            defaultValue: null
        },
        fk_aluno: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        }
    }, {
        tableName: 'contato',
        timestamps: false
    });


    return contatoModel
}