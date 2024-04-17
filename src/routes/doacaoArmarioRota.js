const { tratarMensagensDeErro } = require("../utils/errorMsg")
const authMiddleware = require("../middleware/auth")
const { cadastroDoacaoArmario } = require("../controllers/doacaoArmarioController")

const router = require("express").Router()

router.use(authMiddleware)

router.post("/cadastro", async (req, res) => {

    try {
        const { numeroArmario, idAluno} = req.body
        const data = new Date(req.body.data)
        const doacaoArmario = { numeroArmario, idAluno, data }

        await cadastroDoacaoArmario(doacaoArmario, req.sequelize)
        res.status(201).json({ "msg": "Doação de armario criado com sucesso", "statusCode": "201" })
    }
    catch(err){
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }
})

module.exports = router