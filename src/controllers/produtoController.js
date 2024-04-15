const produtoModel = require("../models/produtoModel")

async function cadastrarProduto(produto,sequelize) {
    try {
        const listaProdutoParaBanco = await criarProdutosParaCadastro(produto)
        const response = await mandarProdutoParaBanco(listaProdutoParaBanco,sequelize)
        return response
    }
    catch (err) {

    }
}

function criarProdutosParaCadastro(produto) {

    return new Promise((resolve, reject) => {

        try {
            const listaProdutos = []

            const listaCores = produto.cores
            const listaTamanho = produto.tamanhos
            const listaFotos = produto.fotos


            listaCores.map((cores) => {
                // console.log(cores)

                listaTamanho.map((tamanho) => {
                    // console.log(tamanho)

                    //Cria o modelo do produto para o banco
                    const produtoModeloBanco = {
                        nome: produto.nome,
                        foto: listaFotos[`${cores}`],
                        tamanho: tamanho,
                        valor: produto.valor,
                        cor: cores,
                        descricao: produto.descricao,
                        brinde: produto.brinde
                    }

                    listaProdutos.push(produtoModeloBanco)

                })
            })
            resolve(listaProdutos)

            console.log(listaProdutos)

        }
        catch (err) {

        }

    })

}

function mandarProdutoParaBanco(listaProdutoParaBanco,sequelize) {



    return new Promise(async (resolve, reject) => {
        const listaReponse = []

        listaProdutoParaBanco.map((produto) => {
            produtoModel(sequelize).create(produto)
                .then((r) => listaReponse.push(r))
                .catch((e) => {
                    listaReponse.push(e)
                })
        })
        resolve(listaReponse)


    })

}


module.exports = {cadastrarProduto}