const { novoErro } = require("../utils/errorMsg")
const { pesquisarUmAssociadoPeloId, associarAluno } = require("./associadoController")
const { pesquisarProdutoAtivoPeloId, pesquisarProdutoPeloId } = require("./produtoController")
const Sequelize = require("sequelize")

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
            console.log(idProduto, quantidadePedido)
            listaCarrinho[`${idProduto}`] = quantidadePedido

            // manda para o banco
            await sequelize.query("call atualizar_carrinho(? , ?)", {
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
            else {
                reject(novoErro("Id do Produto não está presente no carrinho", 400))
                return
            }
            // manda para o banco
            await sequelize.query("call atualizar_carrinho(? , ?)", {
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

            await sequelize.query("select * from todos_carrinhos where id_aluno = ?", {
                replacements: [idAluno],
                type: sequelize.QueryTypes.SELECT
            })
                .then((r) => !!r[0].itens_carrinho == false ? resolve({}) : resolve(r[0].itens_carrinho))
                .catch((err) => reject(err))
        }
        catch (err) {
            reject(err)
        }
    })

}

function criarReserva(tipoPagamento, virandoSocio, aluno, data) {

    return new Promise(async (resolve, reject) => {

        try {
            const sequelize = new Sequelize({
                database: process.env.database_name,
                username: process.env.database_user_root, // dps atualizar para o login funcionario
                password: process.env.database_password_root, // dps atualizar para o senha funcionario
                host: process.env.database_host,
                dialect: 'mysql'
            });

            const valorCarrinho = await valorCarrinhoCompras(aluno, virandoSocio, data, sequelize)
            const idAluno = aluno.id_aluno

            if(valorCarrinho == 0 ){
                reject(novoErro("Carrinho vazio",400))
            }

            await sequelize.query("call criar_reserva(?,?,?,?)", {
                replacements: [idAluno, tipoPagamento, Number(valorCarrinho).toFixed(2), data],
                type: sequelize.QueryTypes.INSERT
            })
                .then((r) => resolve(r))
                .catch((e) => reject(e))

        }
        catch (err) {
            reject(err)
        }
    })

}

function valorCarrinhoCompras(aluno, virandoSocio, data, sequelize) {

    return new Promise(async (resolve, reject) => {

        try {
            const idCarrinho = aluno.id_aluno
            const listaCarrinho = await pesquisarCarrinhoPeloId(idCarrinho, sequelize)
            let alunoSocio = false

            // Define se o aluno é sócio
            await pesquisarUmAssociadoPeloId(aluno.id_aluno, sequelize)
                .then(() => alunoSocio = true)
                .catch(() => alunoSocio = false)

            let valorTotal = 0

            // verifica se ele esta virando sócio
            if (virandoSocio && !alunoSocio) {
                const associacao = { id_aluno: aluno.id_aluno, brinde: false, dataAssociacao: data }
                await associarAluno(associacao, sequelize)
                alunoSocio = true
                valorTotal += 100
            }

            if (Object.keys(listaCarrinho).length === 0) {
                resolve(valorTotal)
            }


            const calcValorProduto = Object.keys(listaCarrinho).map(async (key) => {
                const produto = await pesquisarProdutoAtivoPeloId(key, sequelize);

                if (alunoSocio) {
                    valorTotal += (Number(produto.valor) - Number(produto.desconto_associado)) * Number(listaCarrinho[key]);
                } else {
                    valorTotal += Number(produto.valor) * Number(listaCarrinho[key]);
                }
            });

            await Promise.all(calcValorProduto);
            resolve(valorTotal)
        }
        catch (err) {
            reject(err)
        }


    })

}

function simularDesconto(aluno, sequelize) {
    return new Promise(async (resolve, reject) => {

        try {
            const idCarrinho = aluno.id_aluno
            const listaCarrinho = await pesquisarCarrinhoPeloId(idCarrinho, sequelize)
            let valorDesconto = 0
            let valorTotal = 0

            const calcValorProduto = Object.keys(listaCarrinho).map(async (key) => {
                const produto = await pesquisarProdutoAtivoPeloId(key, sequelize);

                valorDesconto += (Number(produto.valor) - Number(produto.desconto_associado)) * Number(listaCarrinho[key]);
                valorTotal += Number(produto.valor) * Number(listaCarrinho[key]);
            });

            await Promise.all(calcValorProduto);
            resolve({ "Valor com desconto": valorDesconto, "valor sem desconto": valorTotal })
        }
        catch (err) {
            reject(err)
        }


    })
}

function retornarItensCarrinho(aluno, sequelize) {

    return new Promise(async (resolve, reject) => {

        try {
            console.log(aluno)
            const idCarrinho = aluno.id_aluno
            const listaCarrinho = await pesquisarCarrinhoPeloId(idCarrinho, sequelize)
            const response = {}
            let indexProdutoResponse = 0

            if (Object.keys(listaCarrinho).length === 0) {
                resolve(valorTotal)
            }

            const produtosInfo = Object.keys(listaCarrinho).map(async (key) => {

                const produto = await pesquisarProdutoAtivoPeloId(key, sequelize);

                response[indexProdutoResponse] = {
                    idProduto: produto.id_produto,
                    nome: produto.nome,
                    foto: produto.foto[0],
                    cor: produto.cor,
                    tamanho: produto.tamanho,
                    quantidade: listaCarrinho[key],
                    valor: produto.valor,
                    valorComDesconto: Number(produto.valor) - Number(produto.desconto_associado),
                    quantidadeEstoque: produto.qtd_disponivel
                }
                indexProdutoResponse++
            });

            await Promise.all(produtosInfo);

            response["valor"] = await simularDesconto(aluno, sequelize)

            resolve(response)

        }
        catch (err) {
            reject(err)
        }



    })

}

module.exports = { adicionarItemCarrinho, removerItemCarrinho, valorCarrinhoCompras, simularDesconto, retornarItensCarrinho, criarReserva }