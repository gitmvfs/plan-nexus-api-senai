const router = require("express").Router()
const { gerarGraficos } = require("../controllers/graficosController")
const { authMiddleware } = require("../middleware/auth_funcionario")
const { tratarMensagensDeErro } = require("../utils/errorMsg")


router.get("/resultado", authMiddleware, async(req, res) => {

    try {
        const response = await gerarGraficos(req.sequelize)
        res.json(response)
    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }
}


)


module.exports = router