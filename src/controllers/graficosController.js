const { novoErro } = require("../utils/errorMsg")
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

function gerarGraficosComparativos(sequelize) {
    return new Promise(async (resolve, reject) => {

        try {
            let response = {}
            response = graficoAssociadosComparativo(response, sequelize)
            resolve(response)
        }
        catch (err) {

            reject(err)
        }
    })
}

function graficoAssociadosComparativo(response, sequelize) {

    return new Promise(async (resolve, reject) => {
        try {

            let montarResposta = {
                Dia: {
                    total: [],
                    situacao: '',
                    valor: []
                },
                Semana: {
                    total: [],
                    situacao: '',
                    valor: []
                },
                Mes: {
                    total: [],
                    situacao: '',
                    valor: []
                }

            }
            const data = calcularDatas()

            let situacaoHoje;
            let situacaoSemana;
            let situacaoMes;

            let valorHoje;
            let valorSemana;
            let valorMes;

            let totalAssociados = await sequelize.query("SELECT COUNT(*) AS count FROM todos_associados ")
            totalAssociados = totalAssociados[0][0].count

            // COMPARAR HOJE

            // seleciona * associados de hoje
            let associadosHoje = await sequelize.query("SELECT COUNT(*) AS count FROM todos_associados WHERE data_associacao = ?", {
                replacements: [data.hoje],
                types: sequelize.QueryTypes.SELECT
            })

            associadosHoje = associadosHoje[0][0].count

            // seleciona * associados de ontem
            let associadosHojeComparativo = await sequelize.query("SELECT COUNT(*) AS count FROM todos_associados WHERE data_associacao = ?", {
                replacements: [data.dataHojeComparativo],
                types: sequelize.QueryTypes.SELECT
            })

            associadosHojeComparativo = associadosHojeComparativo[0][0].count

            if (associadosHoje > associadosHojeComparativo) {
                situacaoHoje = 'aumentou'
                valorHoje = associadosHoje - associadosHojeComparativo
            }
            else if (associadosHoje == associadosHojeComparativo) {
                situacaoHoje = 'manteve'
                valorHoje = associadosHoje

            }
            else {
                situacaoHoje = 'diminuiu'
                valorHoje = (associadosHoje - associadosHojeComparativo) * -1

            }

            // COMPARAR SEMANA

            // seleciona * associados da semana
            let associadosSemana = await sequelize.query("SELECT COUNT(*) AS count FROM todos_associados WHERE data_associacao >= ?", {
                replacements: [data.dataSemana],
                types: sequelize.QueryTypes.SELECT
            })

            associadosSemana = associadosSemana[0][0].count

            // seleciona * associados de ontem
            let associadosSemanaComparativo = await sequelize.query("SELECT COUNT(*) AS count FROM todos_associados WHERE data_associacao >= ? and data_associacao <= ?", {
                replacements: [data.dataHojeComparativo, data.dataSemana],
                types: sequelize.QueryTypes.SELECT
            })

            associadosSemanaComparativo = associadosSemanaComparativo[0][0].count

            if (associadosSemana > associadosSemanaComparativo) {
                situacaoSemana = 'aumentou'
                valorSemana = associadosSemana - associadosSemanaComparativo
            }
            else if (associadosSemana == associadosSemanaComparativo) {
                situacaoSemana = 'manteve'
                valorSemana = associadosSemana

            }
            else {
                situacaoSemana = 'diminuiu'
                valorSemana = (associadosSemana - associadosSemanaComparativo) * -1

            }

            // COMPARAR MES

            let associadosMes = await sequelize.query("SELECT COUNT(*) AS count FROM todos_associados WHERE data_associacao >= ?", {
                replacements: [data.dataMes],
                types: sequelize.QueryTypes.SELECT
            })

            associadosMes = associadosMes[0][0].count

            // seleciona * associados de ontem
            let associadosMesComparativo = await sequelize.query("SELECT COUNT(*) AS count FROM todos_associados WHERE data_associacao >= ? and data_associacao <= ?", {
                replacements: [data.dataMesComparativo, data.dataMes],
                types: sequelize.QueryTypes.SELECT
            })

            associadosMesComparativo = associadosMesComparativo[0][0].count

            if (associadosMes > associadosMesComparativo) {
                situacaoMes = 'aumentou'
                valorMes = associadosMes - associadosMesComparativo
            }
            else if (associadosMes == associadosMesComparativo) {
                situacaoMes = 'manteve'
                valorMes = associadosMes 

            }
            else {
                situacaoMes = 'diminuiu'
                valorMes = (associadosMes - associadosMesComparativo) * -1

            }


            // MONTAR RESPOSTA
            montarResposta.Dia.total = totalAssociados
            montarResposta.Dia.situacao = situacaoHoje
            montarResposta.Dia.valor = valorHoje

            montarResposta.Semana.total = totalAssociados
            montarResposta.Semana.situacao = situacaoSemana
            montarResposta.Semana.valor = valorSemana

            montarResposta.Mes.total = totalAssociados
            montarResposta.Mes.situacao = situacaoMes
            montarResposta.Mes.valor = valorMes
            
            response['Associado'] = montarResposta
            resolve(response)

        }
        catch (err) {
            reject(err)
        }
    })





}

function calcularDatas() {

    let hoje = new Date();
    let dataHojeComparativo;
    let dataSemana;
    let dataSemanaComparativo;
    let dataMes;
    let dataMesComparativo

    dataHojeComparativo = new Date(hoje)
    dataHojeComparativo.setDate(dataHojeComparativo.getDate() - 1)

    dataSemana = new Date(hoje)
    dataSemana.setDate(dataSemana.getDate() - 7)

    dataSemanaComparativo = new Date(hoje)
    dataSemanaComparativo.setDate(dataSemanaComparativo.getDate() - 14)

    dataMes = new Date(hoje)
    dataMes.setDate(dataMes.getDate() - 30)

    dataMesComparativo = new Date(hoje)
    dataMesComparativo.setDate(dataMesComparativo.getDate() - 60)

    hoje.setHours(0, 0, 0, 0)
    dataHojeComparativo.setHours(0, 0, 0, 0)
    dataSemana.setHours(0, 0, 0, 0)
    dataSemanaComparativo.setHours(0, 0, 0, 0)
    dataMes.setHours(0, 0, 0, 0)
    dataMesComparativo.setHours(0, 0, 0, 0)

    return {
        hoje,
        dataHojeComparativo,
        dataSemana,
        dataSemanaComparativo,
        dataMes,
        dataMesComparativo
    }
}

module.exports = { gerarGraficos, gerarGraficosComparativos }