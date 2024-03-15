const parseXlSX = require("node-xlsx")

function excelToJson(diretorioArquivo) {

    try {
        let arrayResponse = parseXlSX.parse(diretorioArquivo)[0].data //Pega um array a partir dos xlsx ou xls
        const keys = arrayResponse[0] // Pega as chaves do array
        let responseJson = [] // o array com os jsons dos alunos

        for (let index = 1; index < arrayResponse.length; index++) {

            const aluno = arrayResponse[index] // pega apenas os atributos dos alunos sem as chaves

            const obj = {};

            // Pega a chave da lista de chave e o atributo correspondende do aluno para transformar em json
            for (let index = 0; index < aluno.length; index++) {
                obj[keys[index]] = aluno[index]
            }

            responseJson.push(obj) // adiciona o objeto com chave + atributo a lista de json
        }

        console.log(responseJson)

        return responseJson

    }
    catch (err) {
        return new Error("Erro ao converter arquivo de Excel para Json")

    }
}

module.exports = excelToJson