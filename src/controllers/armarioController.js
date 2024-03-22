const armarioModel = require("../models/armarioModel")

function atualizarArmario(numeroArmario, cpf, statusArmario) {

    return new Promise(async (resolve, reject) => {

        try {
            await armarioModel.update(
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

function pesquisarTodosArmario() {

    return new Promise(async (resolve, reject) => {

        try {
            await armarioModel.findAll()
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


module.exports = { atualizarArmario, pesquisarTodosArmario }

