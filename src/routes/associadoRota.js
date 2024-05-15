const router = require("express").Router()
const { verTodosAssociados, associarAluno, removerAssociado } = require("../controllers/associadoController")
const authMiddleware = require("../middleware/auth")
const { tratarMensagensDeErro } = require("../utils/errorMsg")

router.use(authMiddleware)

router.get("/todos", async (req, res) => {
    try {
        const response = await verTodosAssociados(req.sequelize)
            .then((response) => res.status(200).json({ msg: "Consulta realizada com sucesso", "statusCode": "200", "response": response }))
            .catch((e) => console.log(e))
    } catch (error) {
        const erroTratado = await tratarMensagensDeErro(error)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }
})

router.post("/", async (req, res) => {

    try {
        const { id_aluno, brinde } = req.body
        const dataAssociacao = new Date(req.body.data_associacao)
        const associacao = { id_aluno, brinde, dataAssociacao }

        await associarAluno(associacao, req.sequelize)
        res.status(201).json({ msg: "aluno associado com sucesso", "statusCode": 201, "response": associacao })

    } catch (error) {
        const erroTratado = await tratarMensagensDeErro(error)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }
})

router.delete("/delete", async (req, res) => {

    try {
        const { id_aluno } = req.body
        await removerAssociado(id_aluno,req.sequelize)
        res.status(200).json({ msg: "Associado deletado com sucesso", "statusCode": 200 })
    }
    catch (error){
        const erroTratado = await tratarMensagensDeErro(error)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }



})

module.exports = router