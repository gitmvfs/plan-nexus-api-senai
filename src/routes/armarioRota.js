const { atualizarArmario, pesquisarTodosArmario, pesquisarArmarioPorStatus } = require("../controllers/armarioController")
const { definirStatusArmario } = require("../utils/converterString")
const { tratarMensagensDeErro } = require("../utils/errorMsg")
const {authMiddleware} = require("../middleware/auth")

const router = require("express").Router()

// ROTAS PROTEGIDAS
router.use(authMiddleware)

router.patch("/atualizar", async (req, res) => {

    try {
        const { numeroArmario } = req.body
        let statusArmario = req.body.statusArmario
        const idAluno = req.body.idAluno || null

        statusArmario =  await definirStatusArmario(statusArmario)

        const response = await atualizarArmario(numeroArmario, idAluno, statusArmario, req.sequelize)

        res.status(response.status).json({ "msg": response.msg, "statusCode": response.status })
    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }
})

router.get("/todos", async (req, res) => {

    try {
        const response = await pesquisarTodosArmario(req.sequelize)

        res.status(200).json({ "statusCode": 200, "response": response })
    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }

})

router.get("/:statusArmario", async (req, res) => {
    let { statusArmario } = req.params
    console.log(statusArmario)

    try {
        statusArmario = definirStatusArmario(statusArmario)
        const response = await pesquisarArmarioPorStatus(statusArmario, req.sequelize)
        res.status(200).json({ "statusCode": 200, "response": response })
    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }

})

module.exports = router