function cadastroDoacaoArmario(doacaoArmario, sequelize) {

    return new Promise((resolve, reject) => {

        try {
            const { numeroArmario, idAluno, data } = doacaoArmario

            sequelize.query("call doar_armario(?,?,?)", {
                replacements: [idAluno, numeroArmario, data],
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

function visualizarTodasDoacoesArmario(sequelize) {

    return new Promise((resolve, reject) => {
        try {
            sequelize.query("select * from doacao_armario order by data;", {
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

function editarDoacaoArmario(dadosDoacao, sequelize) {

    return new Promise((resolve, reject) => {

        try {
            const { idDoacao, idAluno, numeroArmario, data } = dadosDoacao

            // Verificar se o idDoacao existe, se o idAluno é válido, e se o numero do armário está entre 1 e 280

            sequelize.query("call editar_doacao_armario(?,?,?,?)", {
                replacements: [idDoacao, idAluno, numeroArmario, data],
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

module.exports = { cadastroDoacaoArmario, visualizarTodasDoacoesArmario, editarDoacaoArmario }