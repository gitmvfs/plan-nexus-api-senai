const { tratarMensagensDeErro } = require("../utils/errorMsg")
const {authMiddleware} = require("../middleware/auth")
const { cadastroDoacaoDinheiro, visualizarTodasDoacoesDinheiro, editarDoacaoDinheiro } = require("../controllers/doacaoDinheiroController")

const router = require("express").Router()

router.use(authMiddleware)

router.post("/cadastro", async (req, res) => {

    try {
        const { valorDoado, idAluno, auxilio, contrato } = req.body
        const data = new Date(req.body.data)
        const doacaoDinheiro = { valorDoado, idAluno, auxilio, contrato, data }

        await cadastroDoacaoDinheiro(doacaoDinheiro, req.sequelize)
        res.status(201).json({ "msg": "Doação de dinheiro criado com sucesso", "statusCode": "201" })
    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }
})

router.get("/todos", async (req, res) => {

    try {
        const response = await visualizarTodasDoacoesDinheiro(req.sequelize)
        res.status(200).json({ "msg": "Consulta realizada com sucesso", "statusCode": "200", "response": response })

    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }

})

router.patch("/atualizar", async (req, res) => {

    try {
        const { idDoacao, idAluno, valorDoado, auxilio } = req.body
        const data = new Date(req.body.data)
        const dadosDoacao = { idDoacao, valorDoado, idAluno, auxilio, data }
        const response = await editarDoacaoDinheiro(dadosDoacao, req.sequelize)

        response == 200
            ? res.status(200).json({ "msg": "Atualizado com sucesso", "statusCode": 200 })
            : res.status(400).json({ "msg": "Erro ao atualizar doação monetária, verifique os campos.", "statusCode": 400 })

    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }
})

module.exports = router