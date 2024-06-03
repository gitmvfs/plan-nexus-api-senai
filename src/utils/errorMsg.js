const { Sequelize, ValidationError, DatabaseError } = require("sequelize")
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

                resolve(erroTratado)

            }
            if (err instanceof DatabaseError) {
                if (err.parent.errno == 1370) {
                    mensagem = "Usuario sem permissão"
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
                console.log(err.message)

                if (mensagem == err.message) {
                    console.log("ERRO NÃO TRATADO", err)
                }
                resolve(erroTratado)

            }

            //Erros do auth

            if (mensagem == "Cannot read properties of undefined (reading 'split')") {
                mensagem = "Token vazio."
                status = 403
                resolve(erroTratado)

            }
            else if (mensagem == "Cannot read properties of undefined (reading 'path')") {
                mensagem = "Necessário enviar arquivo."
                status = 400
                resolve(erroTratado)

            }

            const erroTratado = {
                "message": mensagem,
                "status": status
            }
            console.log("\n \n ------------------------------------------------------------------ \n \n")
            console.log("ERRO - ", erroTratado , err )
            console.log("\n \n ------------------------------------------------------------------ \n \n")
            resolve(erroTratado)
        }
        catch {
            resolve("Mensagem de erro não tratada, err msg: ", err.message)
        }

    })

}

module.exports = { tratarMensagensDeErro, novoErro }