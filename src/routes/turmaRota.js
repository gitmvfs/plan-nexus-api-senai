const router = require("express").Router()
const authMiddleware = require("../middleware/auth")
const {tratarMensagensDeErro} = require("../utils/errorMsg")
const {verTodosCursos} = require("../controllers/turmaController")

router.use(authMiddleware)

router.get("/todos", async (req, res) => {
    try {
        const response = await verTodosCursos(req.sequelize)
    
        response.length === 0
        ? res.status(400).send("erro de consulta")
        : res.status(200).json({msg: "Consulta realizada com sucesso", "statusCode": erroTratado.status , "response": response})

    } catch (error) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }
    
})

module.exports = router