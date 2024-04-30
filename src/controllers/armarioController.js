const armarioModel = require("../models/armarioModel")
const { definirStatusArmario } = require("../utils/converterString")

function atualizarArmario(numeroArmario, idAluno, statusArmario, sequelize) {

    return new Promise(async (resolve, reject) => {

        try {
            await armarioModel(sequelize).update(
                {
                    fk_aluno: idAluno,
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
                .then(r => resolve(paginacao(10, r[0])))
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
            sequelize.query("SELECT * FROM todos_armarios WHERE status = ? ORDER BY numero", {
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

function paginacao(numPorPagina, listaArmarios) {
    const numPagina = Math.ceil(listaArmarios.length / numPorPagina);
    const listaResposta = {};
    // console.log(listaArmarios)
    for (let index = 0; index < listaArmarios.length; index++) {
        const paginaAtual = Math.floor(index / numPorPagina);

        if (!listaResposta[paginaAtual]) {
            listaResposta[paginaAtual] = [];
        }
        listaResposta[paginaAtual].push(listaArmarios[index]);
    }
    console.log(listaResposta)
    return listaResposta
}


module.exports = { atualizarArmario, pesquisarTodosArmario, pesquisarArmarioPorStatus }

