const { tratarMensagensDeErro } = require("../utils/errorMsg")
const authMiddleware = require("../middleware/auth")
const { cadastroDoacaoDinheiro, visualizarTodasDoacoesDinheiro, editarDoacaoDinheiro } = require("../controllers/doacaoDinheiroController")
const auditoriaMiddleware = require("../middleware/auditoriaMiddleware")

const router = require("express").Router()

router.use(authMiddleware)

router.post("/cadastro", async (req, res, next) => {

    try {
        const { valorDoado, idAluno, auxilio } = req.body
        const data = new Date(req.body.data)
        const doacaoDinheiro = { valorDoado, idAluno, auxilio, data }

        await cadastroDoacaoDinheiro(doacaoDinheiro, req.sequelize)
        const dadosAuditoria = {
            fk_funcionario: req.funcionario.NIF,
            descricao: "doação de dinheiro realizada com sucesso",
            operacao: "doação de dinheiro",
            resultado: 200,
            data : Date.now(),
            response : doacaoDinheiro
        }

        auditoriaMiddleware(req, res, next, dadosAuditoria)
    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }
})

router.get("/todos", async (req, res, next) => {

    try {
        const response = await visualizarTodasDoacoesDinheiro(req.sequelize)
        
        const dadosAuditoria = {
            fk_funcionario: req.funcionario.NIF,
            descricao: "consulta realizada com sucesso",
            operacao: "ver todas as doações",
            resultado: 200,
            data : Date.now(),
            response : response
        }

        auditoriaMiddleware(req, res, next, dadosAuditoria)
    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }

})

router.patch("/atualizar", async (req, res, next) => {

    try {
        const { idDoacao, idAluno, valorDoado, auxilio } = req.body
        const data = new Date(req.body.data)
        const dadosDoacao = { idDoacao, valorDoado, idAluno, auxilio, data }
        const response = await editarDoacaoDinheiro(dadosDoacao, req.sequelize)

        const dadosAuditoria = {
            fk_funcionario: req.funcionario.NIF,
            descricao: "doação de dinheiro atualizada com sucesso",
            operacao: "editar doação de dinheiro",
            resultado: 200,
            data : Date.now(),
            response : response
        }

        auditoriaMiddleware(req, res, next, dadosAuditoria)

    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }
})

module.exports = router