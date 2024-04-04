// De forma geral falta tratar a feat, principalmente os dados de entrada
// Falta também validar e devolver os erros da operação


const produtoModel = require("../models/produtoModel")

const produto = {
    nome: "camiseta",
    cores: ["branco", "vermelho"],
    tamanhos: ["g", "gg", "p", "pp"],
    fotos: {
        branco: {
            link: "link branco"
        },
        vermelho: {
            link: "link vermelho"
        }
    },
    valor: "10",
    descricao: "Sim é a descrição",
    brinde: true
}

async function cadastrarProduto(produto) {
    try {
        const listaProdutoParaBanco = await criarProdutosParaCadastro(produto)
        const response = await mandarProdutoParaBanco(listaProdutoParaBanco)
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

function mandarProdutoParaBanco(listaProdutoParaBanco) {



    return new Promise(async (resolve, reject) => {
        const listaReponse = []

        listaProdutoParaBanco.map((produto) => {
            produtoModel.create(produto)
                .then((r) => listaReponse.push(r))
                .catch((e) => {
                    listaReponse.push(e)
                })
        })
        resolve(listaReponse)


    })

}

cadastrarProduto(produto)
    .then((r) => console.log(r))
    .catch((e) => console.log(e))