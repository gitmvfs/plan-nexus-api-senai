const { atualizarArmario, pesquisarTodosArmario, pesquisarArmarioPorStatus } = require("../controllers/armarioController")
const { definirStatusArmario } = require("../utils/converterString")
const {tratarMensagensDeErro} = require("../utils/errorMsg")
const authMiddleware = require("../middleware/auth")

const router = require("express").Router()

// ROTAS PROTEGIDAS
router.use(authMiddleware)

router.patch("/atualizar", async (req, res) => {

    try {
        let { numeroArmario, CPF, statusArmario } = req.body
        statusArmario = definirStatusArmario(statusArmario)

        const response = await atualizarArmario(numeroArmario, CPF, statusArmario, req.sequelize)

        response[0] == 1
            ? res.status(200).json({ "msg": "Atualizado com sucesso", "statusCode": 200 })
            : res.status(400).json({ "msg": "Erro ao atualizar armario, verifique os campos.", "statusCode": 400 })
    }
    catch (err) {
        const errMsg = tratarMensagensDeErro(err)
        res.status(500).json({ errMsg: errMsg, "statusCode": 500 })
    }
})

router.get("/todos", async (req, res) => {

    try {
        let response = await pesquisarTodosArmario(req.sequelize)

        response = response[0]
        res.status(200).json({ "statusCode": 200, response   })
    }
    catch (err) {
        const errMsg = tratarMensagensDeErro(err)
        res.status(500).json({ "statusCode": 500, errMsg: errMsg })
    }

})

router.get("/status", async (req, res) => {
    let statusArmario = req.body.statusArmario

    try {
        statusArmario = definirStatusArmario(statusArmario)
        const response = await pesquisarArmarioPorStatus(statusArmario, req.sequelize)
        res.status(200).json({ "statusCode": 200,...response })
    }
    catch (err) {
        const errMsg = tratarMensagensDeErro(err)
        res.status(500).json({ "statusCode": 500, errMsg: errMsg })
    }

})

module.exports = router