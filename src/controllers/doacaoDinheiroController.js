const { novoErro } = require("../utils/errorMsg");
const { salvarImagemAzure } = require("./blobController");

function cadastroDoacaoDinheiro(doacaoDinheiro, sequelize) {

    return new Promise(async (resolve, reject) => {

        try {
            const { valorDoado, idAluno, contrato, data } = doacaoDinheiro
            let auxilio = doacaoDinheiro.auxilio

            if (!!contrato == false) {
                reject(novoErro("Arquivo de contrato não enviado", 400))
                return

            }

            const linkContrato = await salvarImagemAzure('contrato', contrato)


            await sequelize.query("call doar_dinheiro(?,?,?,?,?)", {
                replacements: [idAluno, valorDoado, auxilio, linkContrato, data],
                type: sequelize.QueryTypes.INSERT
            })
                .then(r => resolve(r))
                .catch(e => reject(e));
        }
        catch (err) {
            reject(err)
        }
    })
}


function visualizarTodasDoacoesDinheiro(sequelize) {

    return new Promise(async (resolve, reject) => {
        try {
            await sequelize.query("select * from doacoes_dinheiro order by data;", {
                type: sequelize.QueryTypes.SELECT
            })
                .then(r => resolve(r))
                .catch(e => reject(e));
        }
        catch (err) {
            reject(err)
        }
    })
}

function editarDoacaoDinheiro(dadosDoacao, sequelize) {

    return new Promise(async (resolve, reject) => {

        try {
            const { idDoacao, valorDoado, idAluno, auxilio, data } = dadosDoacao

            // Verificar se o idDoacao existe, se o idAluno é válido

            await sequelize.query("call editar_doacao_dinheiro(?,?,?,?,?)", {
                replacements: [idDoacao, idAluno, valorDoado, auxilio, data],
                type: sequelize.QueryTypes.UPDATE
            })
                .then((r) => resolve(200))
                .catch((e) => reject(400));
        }
        catch (err) {
            reject(err)
        }
    })

}

module.exports = { cadastroDoacaoDinheiro, visualizarTodasDoacoesDinheiro, editarDoacaoDinheiro }