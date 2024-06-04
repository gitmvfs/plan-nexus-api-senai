const { novoErro } = require("../utils/errorMsg")
const { pesquisarProdutoAtivoPeloId } = require("./produtoController")

function adicionarItemCarrinho(idProduto, quantidadePedido, aluno, sequelize) {

    return new Promise(async (resolve, reject) => {
        try {
            const idCarrinho = aluno.id_aluno
            const listaCarrinho = await pesquisarCarrinhoPeloId(idCarrinho, sequelize)


            // Pesquisa pelo produto
            const produto = await pesquisarProdutoAtivoPeloId(idProduto, sequelize)
                .catch((err) => reject(err))

            // verifica se o produto existe
            if (!produto) {
                reject(novoErro("Produto não encontrado", 404))
                return
            }

            // verifica o estoque
            if (produto.qtd_disponivel < quantidadePedido) {
                reject(novoErro("A quantidade do pedido excede o disponivel do produto", 400))
                return
            }

            // adiciona o produto a lista
            listaCarrinho[`${idProduto}`] = quantidadePedido

            // manda para o banco
            await sequelize.query("call adicionar_item_carrinho(? , ?)", {
                replacements: [idCarrinho, JSON.stringify(listaCarrinho)],
                type: sequelize.QueryTypes.UPDATE
            })
                .catch((err) => reject(err))

            resolve(listaCarrinho)

        }
        catch (err) {
            reject(err)
        }
    })
}

function removerItemCarrinho(idProduto, aluno, sequelize) {
    return new Promise(async (resolve, reject) => {
        try {
            const idCarrinho = aluno.id_aluno
            const listaCarrinho = await pesquisarCarrinhoPeloId(idCarrinho, sequelize)

            // adiciona o produto a lista

            if (listaCarrinho.hasOwnProperty(idProduto)) {
                delete listaCarrinho[`${idProduto}`]
            }
            else{
                reject(novoErro("Id do Produto não está presente no carrinho", 400))
                return
            }
            // manda para o banco
            await sequelize.query("call adicionar_item_carrinho(? , ?)", {
                replacements: [idCarrinho, JSON.stringify(listaCarrinho)],
                type: sequelize.QueryTypes.UPDATE
            })
            .catch((err) => reject(err))

            resolve(listaCarrinho)

        }
        catch (err) {
            reject(err)
        }
    })
}

function pesquisarCarrinhoPeloId(idAluno, sequelize) {

    return new Promise(async (resolve, reject) => {
        try {

            await sequelize.query("select * from todos_carrinhos where fk_aluno = ?", {
                replacements: [idAluno],
                type: sequelize.QueryTypes.SELECT
            })
                .then((r) => !!r[0] == false ? resolve({}) : resolve(r[0].itens_carrinho))
                .catch((err) => reject(err))
        }
        catch (err) {
            reject(err)
        }
    })

}

function valorCarrinhoCompras() {

}

module.exports = { adicionarItemCarrinho, removerItemCarrinho, valorCarrinhoCompras }