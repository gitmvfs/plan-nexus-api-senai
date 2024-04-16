const armarioModel = require("../models/armarioModel")
const { definirStatusArmario } = require("../utils/converterString")

function atualizarArmario(numeroArmario, cpf, statusArmario, sequelize) {

    return new Promise(async (resolve, reject) => {

        try {
            await armarioModel(sequelize).update(
                {
                    fk_CPF: cpf,
                    status: statusArmario
                },
                {
                    where: {
                        numero: numeroArmario
                    }
                })
                .then((r) => resolve(r))
                .catch((e) => reject(e))

        }
        catch (err) {
            reject(err)
        }

    })

}

function pesquisarTodosArmario(sequelize) {

    return new Promise(async (resolve, reject) => {

        try {
           sequelize.query("select * from todos_armarios order by numero;")
           .then((r) => resolve(r))
            .catch((e) => reject(e))
        }
        catch (err) {
            reject(err)
        }
    })
}

function pesquisarArmarioPorStatus(status, sequelize) {

    return new Promise(async (resolve, reject) => {

        try {

            await armarioModel(sequelize).findAll({
                where: {
                    status: status
                }
            })
                .then((r) => {
                    const listaArmarios = []
                    r.map((armario) => listaArmarios.push(armario.dataValues))
                    resolve(listaArmarios)
                })
                .catch((e) => reject(e))
        }
        catch (err) {
            reject(err)
        }


    })


}

module.exports = { atualizarArmario, pesquisarTodosArmario, pesquisarArmarioPorStatus }

