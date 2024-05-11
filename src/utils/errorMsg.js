const { Sequelize, ValidationError } = require("sequelize")
const { ZodError } = require("zod")

function novoErro(msg, status) {
    const erro = new Error
    erro.message = msg
    erro.status = status
    return erro
}

function tratarMensagensDeErro(err) {

    return new Promise((resolve, reject) => {

        try {

            let mensagem = err.message
            let status = err.status || 500 // devolve 500 por padrão

            //Erros de valização do Sequelize
            if (err instanceof ValidationError) {
                status = 400 // Como é erro de validação o status sempre vai ser de badRequest
                //Código para duplicação
                if (err.parent.errno == 1062) {
                    mensagem = `Dados já cadastrados: ${err.parent.sqlMessage.split("key")[1].split(".")[1]}` // Devolve qual campo está duplicado

                }
            }

            //Erros de validação do zod

            if (err instanceof ZodError) {

                switch (err.issues[0].code) {

                    //Tipo de dado inválido
                    case "invalid_type":
                        mensagem = `Tipo de dado inválido, confira o campo ${err.issues[0].path[0]}`
                        status = 400
                        break;

                    case "too_small":
                        mensagem = err.issues[0].message
                        status = 400
                        break;

                    default:
                        mensagem = err.issues[0].message
                        break;
                }
            }

            //Erros do auth

            if (mensagem == "Cannot read properties of undefined (reading 'split')") {
                mensagem = "Token vazio."
                status = 403
            }
            else if (mensagem == "Cannot read properties of undefined (reading 'path')") {
                mensagem = "Necessário enviar arquivo."
                status = 400
            }

            const erroTratado = {
                "message": mensagem,
                "status": status
            }

            resolve(erroTratado)
        }
        catch {
            resolve("Mensagem de erro não tratada :" + err)
        }

    })

}

module.exports = { tratarMensagensDeErro, novoErro }