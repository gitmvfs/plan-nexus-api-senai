const armarioModel = require("../models/armarioModel")
const { definirStatusArmario } = require("../utils/converterString")
const { novoErro } = require("../utils/errorMsg")
const { pesquisaAluno } = require("./alunoController")

function atualizarArmario(numeroArmario, idAluno, statusArmario, sequelize) {

    return new Promise(async (resolve, reject) => {

        try {

            const armario = await pesquisarArmarioPeloNumero(numeroArmario, sequelize)

            if (!!armario[0] == false) {
                reject(novoErro("Armário não encontrado, por favor consulte o suporte", 400))

            }

            if (statusArmario == 1) {
                await pesquisaAluno(idAluno, sequelize)

                await sequelize.query("call ocupar_armario(?,?)", {
                    replacements: [idAluno, numeroArmario],
                    type: sequelize.QueryTypes.UPDATE
                })

                resolve({ status: 200, msg: "armario ocupado com sucesso" })

            }
            else if (statusArmario == 2) {
                // trocar para procedure depois
                await sequelize.query("call desocupar_armario(?)", {
                    replacements: [numeroArmario],
                    type: sequelize.QueryTypes.UPDATE
                })
                resolve({ status: 200, msg: "armario desocupado com sucesso" })

            }
            else if (statusArmario == 3) {

                if (armario[0].status == "ocupado") {
                    reject(novoErro("Erro ao trancar armário, ocupado no momento", 400))
                }

                await sequelize.query("call trancar_armario(?)", {
                    replacements: [numeroArmario],
                    type: sequelize.QueryTypes.UPDATE
                })
                resolve({ status: 200, msg: "armario trancado com sucesso" })

            }
        }
        catch (err) {
            reject(err)
        }

    })

}

function pesquisarTodosArmario(sequelize) {

    return new Promise(async (resolve, reject) => {

        try {
            await sequelize.query("select * from todos_armarios order by numero;")
                .then(r => resolve(paginacao(28, r[0])))
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
            await sequelize.query("SELECT * FROM todos_armarios WHERE status = ? ORDER BY numero", {
                replacements: [status],
                type: sequelize.QueryTypes.SELECT
            })
                .then((r) => resolve(r))
                .catch(e => reject(e));
        }
        catch (err) {
            reject(err)
        }
    })


}

function pesquisarArmarioPeloNumero(numeroArmario, sequelize) {

    return new Promise(async (resolve, reject) => {

        try {
            await sequelize.query("SELECT * FROM todos_armarios WHERE numero = ? ", {
                replacements: [numeroArmario],
                type: sequelize.QueryTypes.SELECT
            })
                .then((r) => resolve(r))
                .catch(e => reject(e));
        }
        catch (err) {
            reject(err)
        }




    })


}

function paginacao(numPorPagina, listaArmarios) {
    const numPagina = Math.ceil(listaArmarios.length / numPorPagina);
    const listaResposta = {};
    for (let index = 0; index < listaArmarios.length; index++) {
        const paginaAtual = Math.floor(index / numPorPagina);

        if (!listaResposta[paginaAtual]) {
            listaResposta[paginaAtual] = [];
        }
        listaResposta[paginaAtual].push(listaArmarios[index]);
    }
    return listaResposta
}


module.exports = { atualizarArmario, pesquisarTodosArmario, pesquisarArmarioPorStatus }

