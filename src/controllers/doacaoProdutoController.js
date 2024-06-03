const { salvarImagemAzure } = require("./blobController");
const { novoErro } = require("../utils/errorMsg");
const { pesquisarProdutoAtivoPeloId } = require("./produtoController");


function cadastroDoacaoProduto(doacaoProduto, sequelize) {
    return new Promise(async (resolve, reject) => {
        try {

            const { idAluno, idProduto, quantidade, contrato, data } = doacaoProduto

            const produto = await pesquisarProdutoAtivoPeloId(idProduto, sequelize)

            if(!!produto[0] == false){
                reject(novoErro("Produto não encontrado", 404))
                return
            }

            if (quantidade > produto[0].qtd_disponivel) {
                reject(novoErro("Quantidade maior do que estoque disponivel", 400))
                return
            }

            if (!!contrato == false) {
                reject(novoErro("Arquivo de contrato não enviado", 400))
                return
            }

            const linkContrato = await salvarImagemAzure('contrato', contrato)


            await sequelize.query("call doar_produto(?,?,?,?,?)", {
                replacements: [idAluno, idProduto, quantidade, linkContrato, data],
                type: sequelize.QueryTypes.INSERT
            })
                .then((r) => resolve(r))
                .catch((e) => reject(e))

        } catch (error) {
            reject(error)
        }
    })
}

function editarDoacaoProduto(dadosDoacao, sequelize) {
    return new Promise(async (resolve, reject) => {
        try {
            const { idDoacao, idAluno, idProduto, quantidade, data } = dadosDoacao

            await sequelize.query("call editar_doacao_produto(?,?,?,?,?)", {
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

function verTodasDoacoes(sequelize) {
    return new Promise(async (resolve, reject) => {
        try {
            await sequelize.query("select * from doacoes_produto order by data", {
                type: sequelize.QueryTypes.SELECT
            })
                .then(r => resolve(r))
                .catch(e => reject(e))

        } catch (error) {
            reject(error)
        }
    })
}

module.exports = { verTodasDoacoes, cadastroDoacaoProduto, editarDoacaoProduto }