const { atualizarArmario, pesquisarTodosArmario } = require("../controllers/armarioController")
const { definirStatusArmario } = require("../utils/converterString")
const tratarMensagensDeErro = require("../utils/errorMsg")

const router = require("express").Router()

router.patch("/atualizar", async (req, res) => {

    try {
        let { numeroArmario, CPF, statusArmario } = req.body
        statusArmario = definirStatusArmario(statusArmario)

        const response = await atualizarArmario(numeroArmario,CPF,statusArmario)

        response[0] == 1
            ? res.status(200).json({ "msg": "Atualizado com sucesso", "statusCode": 200 })
            : res.status(400).json({ "msg": "Erro ao atualizar armario, verifique os campos.", "statusCode": 400 })
    }
    catch (err) {
        const errMsg = tratarMensagensDeErro(err)
        res.status(500).json({ errMsg: errMsg, "statusCode": 500 })
    }
})

router.get("/todos",async(req,res) =>{

    try{
        const response = await pesquisarTodosArmario()
        res.status(200).json({"statusCode": 200, data: response})
    }
    catch(err){
        const errMsg = tratarMensagensDeErro(err)
        res.status(500).json({"statusCode": 500, errMsg: errMsg})
    }

})

module.exports = router