function cadastroDoacaoDinheiro(doacaoDinheiro, sequelize) {

    return new Promise((resolve, reject) => {

        try {
            const { valorDoado, idAluno, auxilio, contrato, data } = doacaoDinheiro

            sequelize.query("call doar_dinheiro(?,?,?,?,?)", {
                replacements: [idAluno, valorDoado, auxilio, contrato, data],
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

    return new Promise((resolve, reject) => {
        try {
            sequelize.query("select * from doacoes_dinheiro order by data;", {
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

    return new Promise((resolve, reject) => {

        try {
            const { idDoacao, valorDoado, idAluno, auxilio, data } = dadosDoacao

            // Verificar se o idDoacao existe, se o idAluno é válido

            sequelize.query("call editar_doacao_dinheiro(?,?,?,?,?)", {
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