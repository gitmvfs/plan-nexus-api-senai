const { novoErro } = require("./errorMsg");

function definirGraduacao(objeto) {

    // const listaCursosTecnicos = ["técnico", "técnica", "tecnico", "tecnica"] // palavras-chaves para cursos técnicos
    const listaCursosSuperiores = ["técnologico", "técnologo", "bacharelado", "graduação", "extensão"] // palavras-chaves para cursos superiores

    //Compara se a lista é de curso superior
    for (const palavraChave of listaCursosSuperiores) {

        if (objeto.Tipo.toLowerCase().includes(palavraChave)) {
            objeto.Tipo = "superior";
            break; // Se encontrou, pode parar a iteração
        }
    }

    //Se não for superior é tecnico

    if (!objeto.Tipo.includes("superior")) {
        objeto.Tipo = "tecnico"
    }

    return objeto.Tipo

}

function definirStatusArmario(status) {

    return new Promise((resolve, reject) => {

        let statusLowerCase = status.toLowerCase()

        switch (statusLowerCase) {
            case "ocupado":
                resolve(1)
                break;
            case "desocupado":
                resolve(2)
                break;
            case "trancado":
                resolve(3)
                break;
            default:
                reject(novoErro("Opção inválida do Status Armario, insira : 'Desocupado', 'Ocupado', 'trancado '", 400)) // retorna trancado por padrão
                break;
        }

    })
}

function retirarFormatacao(string) {

    return new String(string).replace("(", "").replace(".", "").replace("-", "").replace(")", "").trim()

}

function definirTipoPagamento(string) {

    return new Promise((resolve, reject) => {

        let stringLower = string.toLowerCase().trim()

        switch (stringLower) {
            case "pix":
                resolve(1)
                break;
            case "crédito":
                resolve(2)
                break;
            case "débito":
                resolve(3)
                break;
            case "dinheiro":
                resolve(4)
                break;
            default:
                reject(novoErro("Opção inválida do tipo pagamento , insira : 'pix', 'crédito', 'débito', 'dinheiro' ", 400)) // retorna trancado por padrão
                break;
        }

    })

}

module.exports = { definirGraduacao, definirStatusArmario, retirarFormatacao, definirTipoPagamento }