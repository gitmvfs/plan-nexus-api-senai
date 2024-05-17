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
                try {
                    imagensAgrupadas[index].fieldname = imagensAgrupadas[index].fieldname.split("][")[1].split("][")[0]

                }
                catch (err) {
                    if (err.message == "Cannot read properties of undefined (reading 'split')") {
                        imagensAgrupadas[index].fieldname = imagensAgrupadas[index].fieldname
                    }
                }

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
                        foto: JSON.stringify(listaDeLinks[`${cor}`]),
                        tamanho: tamanho.trim(),
                        valor: produto.valor,
                        desconto: produto.desconto,
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
        try {

            const listaReponse = []

            listaProdutoParaBanco.map((produto) => {
                const { nome, foto, tamanho, valor, desconto, cor, descricao } = produto
                let brinde = produto.brinde == "true" ? 1 : 0
                const quantidadeEstoque = 0
                sequelize.query("call cadastrar_produto(?,?,?,?,?,?,?,?,?)", {
                    replacements: [nome, descricao, foto, cor, tamanho, valor, brinde, quantidadeEstoque, desconto],
                    types: sequelize.QueryTypes.INSERT
                })
            })
            resolve(listaReponse)

        }
        catch (err) {
            reject(err)
        }
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

function pesquisarProdutoPeloId(idProduto, sequelize) {

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

function pesquisarProdutoBrinde(sequelize) {
    return new Promise(async (resolve, reject) => {

        try {
            //Verifica se o filtro está vazio e passa um json vazio caso contrario passa o proprio filtro
            sequelize.query("select * from todos_produtos where brinde = 1;")
                .then((r) => resolve(r[0]))
                .catch((e) => resolve(e))
        }
        catch (err) {
            reject(err)
        }
    })
}


function pesquisarProdutosUnicos(sequelize) {

    return new Promise(async (resolve, reject) => {

        try {



            const response = await pesquisarTodosProdutos(sequelize)

            const produtosAgrupados = agruparProdutos(response)
            resolve(produtosAgrupados)
        }
        catch (err) {
            reject(err)
        }
    })


}


function definirEstoqueProduto(idProduto, quantidade, sequelize) {

    return new Promise(async (resolve, reject) => {
        try {
            const response = await pesquisarUnicoProduto(idProduto, sequelize)

            if (!!response[0] == false) {
                reject(novoErro("Produto inválido, confira o id", 404))

            }

            sequelize.query("call definir_estoque(?,?)", {
                replacements: [idProduto, quantidade],
                type: sequelize.QueryTypes.UPDATE
            })
            resolve()
        }
        catch (err) {
            reject(err)
        }

    })


}

function atualizarProduto(idProdutoParams, dadosProduto, fotosFile, sequelize) {

    return new Promise(async (resolve, reject) => {


        try {
            const { nome, descricao, cor, valor, tamanho, qtd_estoque, brinde } = dadosProduto
            // prioriza pegar foto e id_produto do dadosProduto, caso não venha quer dizer que o produto veio direto da rota editar e não da função atualizar brinde
            const foto = dadosProduto.foto || fotosFile
            const id_produto = idProdutoParams

            const produtoExiste = await pesquisarProdutoPeloId(id_produto, sequelize)
            if (!produtoExiste[0]) {
                reject(novoErro("Produto não encontrado", 404))
            }
            else {

                // fazer lógica de trocar fotos

                await sequelize.query("call editar_produto (?,?,?,?,?,?,?,?,?)", {
                    replacements: [id_produto, nome, descricao, foto, cor, tamanho, valor, brinde, qtd_estoque],
                    types: sequelize.QueryTypes.UPDATE
                })
                resolve()
            }
        }
        catch (err) {
            reject(err)
        }




    })

}

function trocarProdutoBrinde(listaIdNovoBrinde, sequelize) {

    return new Promise(async (resolve, reject) => {

        try {
            let listaBrindeAtual = agruparProdutos(await pesquisarProdutoBrinde(sequelize))[0]
            !!listaBrindeAtual == false ? listaBrindeAtual = {listaBrindeAtual: []} : "" // retorna um obj vazio caso não tenha nada nele
            
            // compara se o brinde ja está ativo
            if (JSON.stringify(listaIdNovoBrinde) === JSON.stringify(listaBrindeAtual.listaIdProduto)) {
                const erro = novoErro("O brinde está atualmente ativo", 400)
                throw erro
            }
            else {

                // Caso exista algum brinde atual, limpa ele.
                if (!!listaBrindeAtual.listaIdProduto == true) {

                    listaBrindeAtual.listaIdProduto.map(async (id) => {
                        let produto = await pesquisarProdutoPeloId(id, sequelize)
                        produto[0].brinde = 0
                        produto[0].foto = JSON.stringify(produto[0].foto)

                        await atualizarProduto(id, produto[0], null, sequelize)
                    })
                }



                listaIdNovoBrinde.map(async (id) => {

                    let produto = await pesquisarProdutoPeloId(id, sequelize)
                    produto[0].brinde = 1
                    produto[0].foto = JSON.stringify(produto[0].foto)
                    await atualizarProduto(id, produto[0], null, sequelize)
                })
                resolve()
            }

        }
        catch (err) {
            reject(err)
        }


    })

}

function agruparProdutos(produtos) {
    // Objeto para armazenar os produtos agrupados
    const produtosAgrupados = {};

    // Iterar sobre cada produto
    produtos.forEach(produto => {
        // Criar uma chave única baseada no nome e na cor do produto
        const chave = `${produto.nome}-${produto.cor}`;

        // Se a chave ainda não existir no objeto, inicialize-a com uma lista vazia
        if (!produtosAgrupados[chave]) {
            produtosAgrupados[chave] = {
                listaIdProduto: [],
                nome: produto.nome,
                foto: new Set(), // Usando Set para garantir links únicos de fotos
                cor: produto.cor
            };
        }

        // Adicionar o ID do produto à lista de IDs
        produtosAgrupados[chave].listaIdProduto.push(produto.id_produto);

        // Adicionar as fotos do produto ao conjunto de fotos
        produto.foto.forEach(link => produtosAgrupados[chave].foto.add(link));
    });

    // Converter os conjuntos de fotos de volta para arrays
    for (const chave in produtosAgrupados) {
        produtosAgrupados[chave].foto = [...produtosAgrupados[chave].foto];
    }

    // Retornar os produtos agrupados como um array de objetos
    return Object.values(produtosAgrupados);
}

module.exports = { cadastrarProduto, pesquisarTodosProdutos, pesquisarProdutoPeloId, definirEstoqueProduto, pesquisarProdutosUnicos, trocarProdutoBrinde, atualizarProduto }
