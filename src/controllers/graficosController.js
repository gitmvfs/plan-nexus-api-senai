function gerarGraficos(sequelize) {
    return new Promise(async (resolve, reject) => {

        try {
            let response = {}
            response = await estoqueInfo(response, sequelize)
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
                data: {}
              };
            
              produtosAgrupados.forEach((produto, index) => {
                estoque.Label[index] = produto.nome;
                estoque.data[index] = produto.qtd_estoque;
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



module.exports = { gerarGraficos }