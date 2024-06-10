const { pesquisarProdutoPeloId } = require("./produtoController")

function gerarGraficos(sequelize) {
    return new Promise(async (resolve, reject) => {

        try {
            let response = {}
            response = await estoqueInfo(response, sequelize)
            response = await doacaoCustoInfo(response, sequelize)
            response = await itensMaisDoadosInfo(response, sequelize)
            resolve(response)
        }
        catch (err) {

            reject(err)
        }
    })
}


function estoqueInfo(response, sequelize) {

    return new Promise(async (resolve, reject) => {

        try {
            const produtos = await sequelize.query("select * from todos_produtos where status = 1")
                .catch((err) => reject(err))

            const produtosAgrupados = agruparPorNomeCor(produtos[0])

            const estoque = {
                Label: [],
                Data: []
            };

            produtosAgrupados.forEach((produto, index) => {
                estoque.Label.push(produto.nome);
                estoque.Data.push(produto.qtd_estoque);
            });

            response["Estoque"] = estoque
            resolve(response)



        }
        catch (err) {
            reject(err)
        }

    })

}

function doacaoCustoInfo(response, sequelize) {

    return new Promise(async (resolve, reject) => {
        try {
            const doacaoProduto = await sequelize.query("select * from doacoes_produto order by data")
            const doacaoDinheiro = await sequelize.query("select * from doacoes_dinheiro order by data")
            let index = 0

            let totalDoacaoProduto = 0
            let totalDoacaoDinheiro = 0

            const resultadoDoacaoProduto = doacaoProduto[0].map(async (doacao_P) => {
                let produto = await pesquisarProdutoPeloId(doacao_P.id_produto, sequelize)
                produto = produto[0]
                totalDoacaoProduto += Number(produto.valor) * (doacao_P.quantidade)
            });

            doacaoDinheiro[0].map((doacaoDinheiro) => {
                totalDoacaoDinheiro += Number(doacaoDinheiro.quantia);
            });

            await Promise.allSettled(resultadoDoacaoProduto)

            const doacao = {
                Label:
                    ["Produto", "Dinheiro"],
                Data: [totalDoacaoProduto, totalDoacaoDinheiro]
            }


            response["Doacao"] = doacao
            resolve(response)

        }
        catch (err) {
            reject(err)
        }

    })
}

function itensMaisDoadosInfo(response, sequelize) {
    return new Promise(async (resolve, reject) => {
        try {

            const doacaoProduto = await sequelize.query("select * from doacoes_produto order by id_produto")
            const listaProdutosMaisDoados = listarProdutosMaisDoados(doacaoProduto)
            let index = 0

            const produtosMaisDoados = {
                Label: [],
                Data: []
            }

            listaProdutosMaisDoados.map(produto => {
                produtosMaisDoados.Label.push(produto.nome)
                produtosMaisDoados.Data.push(produto.quantidadeTotal)
                index++
            })
            response["ProdutosMaisDoados"] = produtosMaisDoados
            resolve(response)

        }
        catch (err) {
            reject(err)
        }
    })
}

function itensMaisVendidosInfo(response, sequelize) {
    return new Promise((resolve, reject) => {



    })
}


function agruparPorNomeCor(produtos) {
    const agrupados = {};

    produtos.forEach(produto => {
        const chave = `${produto.nome}_${produto.cor}`;
        if (!agrupados[chave]) {
            agrupados[chave] = {
                nome: produto.nome,
                cor: produto.cor,
                qtd_estoque: 0,
                produtos: []
            };
        }
        agrupados[chave].qtd_estoque += produto.qtd_estoque;
        agrupados[chave].produtos.push(produto);
    });

    return Object.values(agrupados);
}

function listarProdutosMaisDoados(doacoes) {
    // Combinar todas as listas de doações em uma única lista
    const todasDoacoes = doacoes.flat();

    // Agrupar as doações por produto e calcular a quantidade total doada para cada produto
    const doacoesPorProduto = todasDoacoes.reduce((acc, doacao) => {
        if (!acc[doacao.produto]) {
            acc[doacao.produto] = {
                nome: doacao.produto,
                quantidadeTotal: 0
            };
        }
        acc[doacao.produto].quantidadeTotal += doacao.quantidade;
        return acc;
    }, {});

    // Converter o objeto de doações por produto em uma lista
    const listaDeDoacoes = Object.values(doacoesPorProduto);

    // Ordenar a lista de produtos pela quantidade total doada em ordem decrescente
    listaDeDoacoes.sort((a, b) => b.quantidadeTotal - a.quantidadeTotal);

    return listaDeDoacoes;
}

module.exports = { gerarGraficos }