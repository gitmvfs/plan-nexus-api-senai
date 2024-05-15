const produtoModel = require("../models/produtoModel")
const { novoErro } = require("../utils/errorMsg")
const { salvarImagemAzure } = require("./blobController")

async function cadastrarProduto(produto, imagensAgrupadas, sequelize) {
    try {
        const listaProdutoParaBanco = await criarProdutosParaCadastro(produto, imagensAgrupadas)
        const response = await mandarProdutoParaBanco(listaProdutoParaBanco, sequelize)
        return response
    }
    catch (err) {

    }
}

function criarProdutosParaCadastro(produto, imagensAgrupadasParams) {

    return new Promise(async (resolve, reject) => {

        try {

            // PARTEE PARA FATORAR -- ENVIO DE IMAGEM PARA O BLOB

            // Separa as imagens em grupos por cor (após pegar o link do blob)

            const imagensAgrupadas = imagensAgrupadasParams;
            const listaDeLinks = {}; // lista com a cor da imagem + url de resposta
            const listaErrosImagem = [] // lista com os erros de tentar cadastrar imagem

            for (let index = 0; index < imagensAgrupadas.length; index++) {
                imagensAgrupadas[index].fieldname = imagensAgrupadas[index].fieldname.split("][")[1].split("][")[0]
            }

            const promessasDeSalvarImagens = imagensAgrupadas.map((imagem) => {
                return new Promise((resolve, reject) => {
                    salvarImagemAzure("produto", imagem)
                        .then((imageUrl) => {
                            resolve({ nome: imagem.fieldname, url: imageUrl });
                        })
                        .catch((error) => {
                            // Se houver algum erro ao salvar a imagem, você rejeita a promessa com o erro
                            reject(error);
                        });
                });
            });

            await Promise.all(promessasDeSalvarImagens)
                .then((imagemSalvas) => {
                    // Quando todas as imagens forem salvas com sucesso, você pode criar a lista de imagens com os links

                    imagemSalvas.map((imagem) => {
                        // Verifica se a chave existe e cria caso não exista
                        if (`${imagem.nome}` in listaDeLinks) {
                        } else {
                            listaDeLinks[`${imagem.nome}`] = [];
                        }

                        listaDeLinks[`${imagem.nome}`].push(`${imagem.url}`)
                    })

                    // Aqui você pode fazer o que quiser com a lista de links, como imprimir ou retornar
                })
                .catch((error) => {
                    listaErrosImagem.push(error.message)
                });

            // FATORAR ATÉ AQUI -- ENVIO DE IMAGEM BLOB 

            const listaProdutos = []

            const listaCores = produto.cores
            const listaTamanho = produto.tamanhos

            listaCores.map((cores) => {

                listaTamanho.map((tamanho) => {

                    let cor = cores.trim()

                    //Cria o modelo do produto para o banco
                    const produtoModeloBanco = {
                        nome: produto.nome,
                        foto: listaDeLinks[`${cor}`],
                        tamanho: tamanho.trim(),
                        valor: produto.valor,
                        cor: cor,
                        descricao: produto.descricao,
                        brinde: produto.brinde
                    }

                    listaProdutos.push(produtoModeloBanco)
                })
            })

            resolve(listaProdutos)


        }
        catch (err) {
            console.log(err.message)
        }

    })

}

function mandarProdutoParaBanco(listaProdutoParaBanco, sequelize) {



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

function pesquisarTodosProdutos(sequelize) {

    return new Promise(async (resolve, reject) => {

        try {
            //Verifica se o filtro está vazio e passa um json vazio caso contrario passa o proprio filtro
            sequelize.query("select * from todos_produtos;")
                .then((r) => resolve(r[0]))
                .catch((e) => resolve(e))
        }
        catch (err) {
            reject(err)
        }
    })

}

function pesquisarUnicoProduto(idProduto, sequelize) {

    return new Promise(async (resolve, reject) => {

        try {
            await sequelize.query("select * from todos_produtos where id_produto = ?;", {
                replacements: [idProduto],
                type: sequelize.QueryTypes.SELECT
            })
                .then((r) => resolve(r))
                .catch((e) => reject(e))
        }
        catch (err) {
            reject(err)
        }
    })

}

function definirEstoqueProduto(idProduto, quantidade, sequelize) {

    return new Promise(async (resolve, reject) => {
        try {
            const response = await pesquisarUnicoProduto(idProduto,sequelize)

            if (!!response[0] == false) {
                reject(novoErro("Produto inválido, confira o id", 404))

            }

            sequelize.query("call definir_estoque(?,?)",{
                replacements:[idProduto,quantidade],
                type: sequelize.QueryTypes.UPDATE
            })
            resolve()
        }
        catch (err) {
            reject(err)
        }

    })


}

module.exports = { cadastrarProduto, pesquisarTodosProdutos, pesquisarUnicoProduto, definirEstoqueProduto }
