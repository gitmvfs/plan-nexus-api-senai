const { pesquisarProdutoPeloId } = require("./produtoController")

function gerarGraficos(sequelize) {
    return new Promise(async (resolve, reject) => {

        try {
            let response = {}
            response = await estoqueInfo(response, sequelize)
            response = await doacaoCustoInfo(response, sequelize)
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

            const produtosAgrupados = agruparProdutos(produtos[0])

            const estoque = {
                Label: {},
                Data: {}
            };

            produtosAgrupados.forEach((produto, index) => {
                estoque.Label[index] = produto.nome;
                estoque.Data[index] = produto.qtd_estoque;
            });

            response["Estoque"] = estoque
            resolve(response)



        }
        catch (err) {
            reject(err)
        }

    })

}
function agruparProdutos(produtos) {
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
                Label: {
                    0: "Produto",
                    1: "Dinheiro"
                },
                Data: {
                    0: totalDoacaoProduto,
                    1: totalDoacaoDinheiro
                }
            }


            response["Doacao"] = doacao
            resolve(response)

        }
        catch (err) {
            reject(err)
        }

    })
}

module.exports = { gerarGraficos }