const router = require("express").Router()
const {authMiddleware} = require("../middleware/auth_funcionario")
const {tratarMensagensDeErro} = require("../utils/errorMsg")
const {verTodosCursos} = require("../controllers/turmaController")

router.use(authMiddleware)

router.get("/todos", async (req, res) => {
    try {
        const response = await verTodosCursos(req.sequelize)
        
        !!response  == false
        ? res.status(400).send("erro de consulta")
        : res.status(200).json({msg: "Consulta realizada com sucesso", "statusCode": 200 , "response": response})

    } catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }
    
})

module.exports = router