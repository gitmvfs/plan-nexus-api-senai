const { tratarMensagensDeErro } = require("../utils/errorMsg")
const authMiddleware = require("../middleware/auth")
const { cadastroDoacaoArmario, visualizarTodasDoacoesArmario, editarDoacaoArmario } = require("../controllers/doacaoArmarioController")
const auditoriaMiddleware = require("../middleware/auditoriaMiddleware")

const router = require("express").Router()

router.use(authMiddleware)

router.post("/cadastro", async (req, res, next) => {

    try {
        const { numeroArmario, idAluno } = req.body
        const data = new Date(req.body.data)
        const doacaoArmario = { numeroArmario, idAluno, data }

        await cadastroDoacaoArmario(doacaoArmario, req.sequelize)
        
        const dadosAuditoria = {
            fk_funcionario: req.funcionario.NIF,
            descricao: "doação de armário realizado com sucesso",
            operacao: "doação de armário",
            resultado: 200,
            data : Date.now(),
            response : doacaoArmario
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
        const response = await visualizarTodasDoacoesArmario(req.sequelize)
        
        const dadosAuditoria = {
            fk_funcionario: req.funcionario.NIF,
            descricao: "consulta realizada com sucesso",
            operacao: "ver todos os armários",
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
        const { idDoacao, idAluno, numeroArmario } = req.body
        const data = new Date(req.body.data)
        const dadosDoacao = { idDoacao, idAluno, numeroArmario, data }
        console.log(dadosDoacao)
        const response = await editarDoacaoArmario(dadosDoacao, req.sequelize)

        const dadosAuditoria = {
            fk_funcionario: req.funcionario.NIF,
            descricao: "doação de armário atualizado com sucesso",
            operacao: "edição de armário",
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