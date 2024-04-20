// const sequelize = require('sequelize')
const alunoModel = require('../models/alunoModel')
const produtoModel = require('../models/produtoModel')
const reservaModel = require('../models/reservaModel')


// editar reserva
// ver reservas

function visualizarTodasReservas(sequelize){
    return new Promise((resolve, reject) => {
        try{
            sequelize.query("select * from todas_reservas order by data;", {
                type: sequelize.QueryTypes.SELECT
            })
                .then(r => resolve(r))
                .catch(e => reject(e))
        }
        catch(err){
            reject(err)
        }
    })
}

function atualizarStatus(status, sequelize){
   return new Promise((resolve, reject) => {
        try {
            sequelize.update("call efetuar_reserva")
            .then((r)=> resolve(r))
            .catch((e) => reject(e))
        } catch (error) {
            reject(err)
        }
   })
}


/* select a.nome FROM aluno a WHERE 
(a.id_aluno IN 
(SELECT r.fk_aluno FROM reserva r 
    WHERE a.id_aluno = r.fk_aluno)
)
 */

function criarReserva(reserva, sequelize){

    return new Promise(async (resolve, reject) =>{
        try {
            const {fk_aluno, fk_produto, quantidade, retirada} = reserva

            sequelize.query("call criar_reserva(?,?,?,?)", {
        replacements: [fk_aluno, fk_produto, quantidade, retirada], 
        type: sequelize.QueryTypes.INSERT})
        
            .then((r) => {resolve(r)})
            .catch((e) => {reject(e)})  
        } catch (e) {
            reject(e)
        }
    })
}


function pesquisarUmaReserva(id_reserva, fk_aluno){
    return new Promise(async(resolve, reject) => {
        try {

            const reserva = await reservaModel(sequelize).findOne({
                attributes: ['nome'],
                where: {fk_aluno: sequelize.literal("select a.nome FROM aluno a WHERE (a.id_aluno IN (SELECT r.fk_aluno FROM reserva r WHERE a.id_aluno = r.fk_aluno))")}
            })



            reserva == null
                ? reject("reserva não encontrada.")
                :resolve(reserva.dataValues)
        } catch (error) {
            console.log(err)
            reject(err)
        }
    })
}

module.exports = {criarReserva}
