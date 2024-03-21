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
        catch(err){
            reject(err)
        }

    })

}

function pesquisarTodosArmario(){

    armarioModel.findAll({
        where:condicao
    })

}

module.exports = {atualizarArmario}

