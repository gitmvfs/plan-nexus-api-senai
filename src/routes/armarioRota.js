const { atualizarArmario } = require("../controllers/armarioController")
const { definirStatusArmario } = require("../utils/converterString")

const router = require("express").Router()

router.patch("/atualizar", async (req, res) => {

    try {
        let { numeroArmario, CPF, statusArmario } = req.body
        statusArmario = definirStatusArmario(statusArmario)

        const response = await atualizarArmario(numeroArmario,CPF,statusArmario)

        response[0] == 1
            ? res.json({ "msg": "Atualizado com sucesso", "statusCode": 200 }).status(200)
            : res.json({ "msg": "Erro ao atualizar armario, verifique os campos.", "statusCode": 400 }).status(400)
    }
    catch (err) {
        const errMsg = tratarMensagensDeErro(err)
        res.json({ errMsg: errMsg, "statusCode": 500 }).status(500)
    }
})

module.exports = router