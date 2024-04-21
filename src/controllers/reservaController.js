// const sequelize = require('sequelize')
const alunoModel = require('../models/alunoModel')
const produtoModel = require('../models/produtoModel')
const reservaModel = require('../models/reservaModel')


// editar reserva
// ver reservas

function visualizarTodasReservas(sequelize) {
    return new Promise((resolve, reject) => {
        try {
            sequelize.query("select * from todas_reservas order by retirada;")
                .then(r => resolve(r[0]))
                .catch(e => reject(e))
        }
        catch (err) {
            reject(err)
        }
    })
}

function cancelarReserva(id_reserva, sequelize) {
    return new Promise(async(resolve, reject) => {
        
        try {
                    await reservaModel(sequelize).update("call cancelar_reserva", {where: {id_reserva : id_reserva}})
                    .then((r) => resolve(r))
                    .catch((e) => reject(e))
        } catch (err) {
            reject(err)
        }
    })
}

function confirmarReserva(id_reserva, status, sequelize) {
    return new Promise(async(resolve, reject) => {
        
        try {

                    await reservaModel(sequelize).update("call efetuar_reserva", {where: {id_reserva : id_reserva}})
                    .then((r) => resolve(r))
                    .catch((e) => reject(e))
        } catch (err) {
            reject(err)
        }
    })
}

function criarReserva(reserva, sequelize) {

    return new Promise((resolve, reject) => {
        try {
            const { fk_aluno, fk_produto, quantidade, dataRetirada:retirada } = reserva

            sequelize.query("call criar_reserva(?,?,?,?)", {
                replacements: [fk_aluno, fk_produto, quantidade, retirada],
                type: sequelize.QueryTypes.INSERT
            })

                .then((r) => { resolve(r) })
                .catch((e) => { reject(e) })
        } catch (e) {
            reject(e)
        }
    })
}


function pesquisarUmaReserva(id_reserva, sequelize) {
    return new Promise(async (resolve, reject) => {
        try {

            const reserva = await reservaModel(sequelize).findOne({
                where: { id_reserva }
            })

            reserva == null
                ? reject("reserva não encontrada.")
                : resolve(reserva.dataValues)
        } catch (err) {
            console.log(err)
            reject(err)
        }
    })
}

module.exports = { criarReserva, pesquisarUmaReserva, cancelarReserva, visualizarTodasReservas }
