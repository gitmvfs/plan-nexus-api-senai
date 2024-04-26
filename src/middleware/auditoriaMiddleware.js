const { tratarMensagensDeErro } = require("../utils/errorMsg")

const auditoriaMiddleware = (req, res, next, dadosAuditoria) => {
    return new Promise(async(resolve, reject) => {
        try {
            const {fk_funcionario, descricao, operacao, resultado, data, response} = dadosAuditoria
            console.log("ola")
            console.log(dadosAuditoria)
        } catch (err) {
            const erroTratado = await tratarMensagensDeErro(err)
            res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
        }
    })
}

module.exports = auditoriaMiddleware