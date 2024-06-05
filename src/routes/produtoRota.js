const produtoModel = require("../models/produtoModel")
const { novoErro } = require("../utils/errorMsg")
const { salvarImagemAzure } = require("./blobController")
const Sequelize = require("sequelize")

async function cadastrarProduto(produto, imagensAgrupadas, sequelize) {
    return new Promise(async (resolve, reject) => {

        try {
            const listaProdutoParaBanco = await criarProdutosParaCadastro(produto, imagensAgrupadas)
            const response = await mandarProdutoParaBanco(listaProdutoParaBanco, sequelize)
            resolve(response)
        }
        catch (err) {
            reject(err)
        }
    })
}

function criarProdutosParaCadastro(produto, imagensAgrupadasParams) {

    return new Promise(async (resolve, reject) => {

        try {

            // PARTEE PARA FATORAR -- ENVIO DE IMAGEM PARA O BLOB

            // Separa as imagens em grupos por cor (após pegar o link do blob)
            if (!!imagensAgrupadasParams[0] == false) {
                reject(novoErro("Nenhuma imagem foi inserida.", 400))

            }
            const imagensAgrupadas = imagensAgrupadasParams;
            const listaDeLinks = {}; // lista com a cor da imagem + url de resposta
            const listaErrosImagem = [] // lista com os erros de tentar cadastrar imagem
            console.log(imagensAgrupadas)

            for (let index = 0; index < imagensAgrupadas.length; index++) {
                try {
                    if (imagensAgrupadas[index].fieldname.contains('][')) {
                        imagensAgrupadas[index].fieldname = imagensAgrupadas[index].fieldname.split("][")[2]
                    }
                }
                catch (err) { console.log(err) }

            }

            const promessasDeSalvarImagens = imagensAgrupadas.map((imagem) => {
                return new Promise((resolve, reject) => {
                    salvarImagemAzure("produto", imagem)
                        .then((imageUrl) => {
                            resolve({ nome: imagem.fieldname, url: imageUrl });
                            console.log(imageUrl)
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
            reject(err)
        }

    })

}

function mandarProdutoParaBanco(listaProdutoParaBanco, sequelize) {

    return new Promise(async (resolve, reject) => {
        try {

            const listaReponse = []

            listaProdutoParaBanco.map(async (produto) => {
                const { nome, foto, tamanho, valor, desconto, cor, descricao } = produto
                let brinde = produto.brinde == "true" ? 1 : 0
                const quantidadeEstoque = 0

                await sequelize.query("call cadastrar_produto(?,?,?,?,?,?,?,?,?)", {
                    replacements: [nome, descricao, foto, cor, tamanho, valor, brinde, quantidadeEstoque, desconto],
                    types: sequelize.QueryTypes.INSERT
                })
                    .catch((e) => reject(e))
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
            await sequelize.query("select * from todos_produtos;")
                .then((r) => resolve(r[0]))
                .catch((e) => resolve(e))
        }
        catch (err) {
            reject(err)
        }
    })

}

function pesquisarProdutoAtivoPeloId(idProduto, sequelize) {
    return new Promise(async (resolve, reject) => {

        try {
            await sequelize.query("select * from todos_produtos where id_produto = ? and status = ?;", {
                replacements: [idProduto, 1],
                type: sequelize.QueryTypes.SELECT
            })
                .then((r) => resolve(r[0]))
                .catch((e) => reject(e))
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
            await sequelize.query("select * from todos_produtos where brinde = 1;")
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

function pesquisarTodosProdutosAtivos() {
    return new Promise(async (resolve, reject) => {

        try {
            const sequelize = new Sequelize({
                database: process.env.database_name,
                username: process.env.database_user_root, // dps atualizar para o login funcionario
                password: process.env.database_password_root, // dps atualizar para o senha funcionario
                host: process.env.database_host,
                dialect: 'mysql'
            });


            await sequelize.query("select * from todos_produtos WHERE status = 1 ;")
                .then((r) => resolve(r[0]))
                .catch((e) => resolve(e))
        }
        catch (err) {
            reject(err)
        }
    })


}


function definirEstoqueProduto(idProduto, quantidade, sequelize) {

    return new Promise(async (resolve, reject) => {
        try {
            const response = await pesquisarProdutoPeloId(idProduto, sequelize)

            if (!!response[0] == false) {
                reject(novoErro("Produto inválido, confira o id", 404))

            }

            await sequelize.query("call definir_estoque(?,?)", {
                replacements: [idProduto, quantidade],
                type: sequelize.QueryTypes.UPDATE
            })
                .then((r) => resolve())
                .catch((err) => reject(err))
        }
        catch (err) {
            reject(err)
        }

    })


}
async function atualizarProduto(idProdutoParams, dadosProduto, fotosFile, sequelize) {
    return new Promise(async (resolve, reject) => {
        try {
            const { nome, descricao, cor, valor, tamanho, desconto_associado } = dadosProduto
            const fotoArray = dadosProduto.foto instanceof Array == true ? dadosProduto.foto : new Array(dadosProduto.foto)
            const id_produto = idProdutoParams
            let brinde = dadosProduto.brinde == "true" ? 1 : 0

            if (!!linksFotosAntigas[0] == false && fotos[0] == false) {
                reject(novoErro("Nenhum link e/ou foto foi inserido", 400))
                return
            }

            if (fotosFile != null) {

                const salvarImagensPromises = fotosFile.map(async (foto) => {
                    const link = await salvarImagemAzure('produto', foto)
                    return link
                })

                const novasFotos = await Promise.all(salvarImagensPromises)
                fotoArray.push(...novasFotos)

            }

            const produtoExiste = await pesquisarProdutoPeloId(id_produto, sequelize)

            if (!produtoExiste[0]) {
                reject(novoErro("Produto não encontrado", 404))
            }
            else {
                console.log(fotoArray)
                await sequelize.query("call editar_produto (?,?,?,?,?,?,?,?,?)", {
                    replacements: [id_produto, nome, descricao, JSON.stringify(fotoArray), cor, tamanho, valor, brinde, desconto_associado],
                    types: sequelize.QueryTypes.UPDATE
                })
                    .catch((e) => reject(e))

            }
            resolve()

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
            !!listaBrindeAtual == false ? listaBrindeAtual = { listaBrindeAtual: [] } : "" // retorna um obj vazio caso não tenha nada nele

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
                        produto[0].brinde = "false"
                        produto[0].foto = produto[0].foto

                        await atualizarProduto(id, produto[0], null, sequelize)
                    })
                }



                listaIdNovoBrinde.map(async (id) => {

                    let produto = await pesquisarProdutoPeloId(id, sequelize)

                    if (!!produto[0] == false) {
                        reject(novoErro(`Id do produto não encontrado: ${id}`))
                        return;
                    }
                    produto[0].brinde = "true"
                    produto[0].foto = produto[0].foto

                    await atualizarProduto(id, produto[0], null, sequelize)
                })

            }
            console.log("CHEGAMOS")
            resolve()

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
                cor: produto.cor,
                brinde: produto.brinde
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

function inativarProduto(idProduto, sequelize) {

    return new Promise(async (resolve, reject) => {

        try {

            await pesquisarProdutoPeloId(idProduto, sequelize)
                .then((r) => {
                    if (!!r[0] == false) {
                        reject(novoErro("Produto não encontrado", 400))
                        return
                    }
                })
                .catch((err) => reject(err))


            await sequelize.query("call inativar_produto (?)", {
                replacements: [idProduto],
                types: sequelize.QueryTypes.UPDATE
            })
                .catch((e) => reject(e))

            resolve()
        }
        catch (err) {
            reject(err)
        }



    })

}

module.exports = { cadastrarProduto, pesquisarTodosProdutos, pesquisarProdutoPeloId, definirEstoqueProduto, pesquisarProdutosUnicos, trocarProdutoBrinde, atualizarProduto, inativarProduto, pesquisarTodosProdutosAtivos, pesquisarProdutoAtivoPeloId }
