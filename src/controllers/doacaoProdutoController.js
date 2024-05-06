function cadastroDoacaoProduto(doacaoProduto, sequelize){
    return new Promise((resolve, reject) => {
        try {
            
            const { idAluno, idProduto, quantidade, contrato, data } = doacaoProduto

            sequelize.query("call doar_produto(?,?,?,?,?)", {
                replacements: [idAluno, idProduto, quantidade, contrato, data],
                type: sequelize.QueryTypes.INSERT
            })
                .then((r) => resolve(r))
                .catch((e) => reject(e))

        } catch (error) {
            reject(error)
        }
    })
}

function editarDoacaoProduto(dadosDoacao, sequelize){
    return new Promise((resolve, reject) => {
        try {
            const {idDoacao, idAluno, idProduto, quantidade, data} = dadosDoacao

            sequelize.query("call editar_doacao_produto(?,?,?,?,?)", {
                replacements: [idDoacao, idAluno, idProduto, quantidade, data],
                type: sequelize.QueryTypes.UPDATE
            })
                .then((r) => resolve(r))
                .catch((e) => reject(e))

        } catch (error) {
            reject(error)
        }
    })
}

function verTodasDoacoes(sequelize){
    return new Promise((resolve, reject) => {
        try {
            sequelize.query("select * from doacoes_produto order by data", {
                type: sequelize.QueryTypes.SELECT
            })
                .then(r => resolve(r))
                .catch(e => reject(e))

        } catch (error) {
            reject(error)
        }
    })
}

module.exports = {verTodasDoacoes, cadastroDoacaoProduto, editarDoacaoProduto}