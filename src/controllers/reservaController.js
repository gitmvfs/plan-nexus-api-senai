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
            const reservaExiste = await pesquisarUmaReserva(id_reserva, sequelize)
            if(!reservaExiste){
                return res.status(404).send('reserva não encontrada.')
            }
                await reservaModel(sequelize).update("call cancelar_reserva", {where: {id_reserva : id_reserva},
            })
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

            await sequelize.query('SELECT * FROM todas_reservas WHERE id_reserva = ?', {
                replacements: [id_reserva],
                type: sequelize.QueryTypes.SELECT,
            })
            .then((r) => {resolve(r)})
            .catch((e) => {reject(e)})
            

        } catch (err) {
            console.log(err)
            reject(err)
        }
    })
}

module.exports = { criarReserva, pesquisarUmaReserva, cancelarReserva, confirmarReserva, visualizarTodasReservas }
