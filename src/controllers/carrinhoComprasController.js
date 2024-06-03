function adicionarItemCarrinho(idProduto, quantidade, aluno, sequelize) {

    return new Promise(async (resolve, reject) => {
        try {

            const listaCarrinho = { '1': '2', '2': '3' }

            const idCarrinho = aluno.id_aluno

            // => produto e quantidade

            listaCarrinho[`${idProduto}`] = quantidade


            await sequelize.query("call adicionar_item_carrinho(? , ?)", {
                replacements: [idCarrinho, JSON.stringify(listaCarrinho)],
                type: sequelize.QueryTypes.UPDATE
            })

            resolve()

        }
        catch(err){
            reject(err)
        }
    })
}

function valorCarrinhoCompras() {

}

module.exports = { adicionarItemCarrinho, valorCarrinhoCompras }