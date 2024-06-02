const { tratarMensagensDeErro } = require("../utils/errorMsg")
const {authMiddleware} = require("../middleware/auth_funcionario")
const { cadastroDoacaoArmario, visualizarTodasDoacoesArmario, editarDoacaoArmario } = require("../controllers/doacaoArmarioController")

const router = require("express").Router()

router.use(authMiddleware)

router.post("/cadastro", async (req, res) => {

    try {
        const { numeroArmario, idAluno, contrato } = req.body
        const data = new Date(req.body.data)
        const doacaoArmario = { numeroArmario, idAluno, contrato, data }

        await cadastroDoacaoArmario(doacaoArmario, req.sequelize)
        res.status(201).json({ "msg": "Doação de armario criado com sucesso", "statusCode": "201" })
    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }
})

router.get("/todos", async (req, res) => {


    try {
        const response = await visualizarTodasDoacoesArmario(req.sequelize)
        res.status(200).json({ "msg": "Consulta realizada com sucesso", "statusCode": "200", "response": response })

    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }

})

router.patch("/atualizar", async (req, res) => {

    try {
        const { idDoacao, idAluno, numeroArmario } = req.body
        const data = new Date(req.body.data)
        const dadosDoacao = { idDoacao, idAluno, numeroArmario, data }
        console.log(dadosDoacao)
        const response = await editarDoacaoArmario(dadosDoacao, req.sequelize)

        response == 200
            ? res.status(200).json({ "msg": "Atualizado com sucesso", "statusCode": 200 })
            : res.status(400).json({ "msg": "Erro ao atualizar doação de armários, verifique os campos.", "statusCode": 400 })

    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }
})

module.exports = router