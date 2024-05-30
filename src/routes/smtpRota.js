const router = require("express").Router()
const jwt = require("jsonwebtoken")
const { enviarEmailRedefinirSenha, redefinirSenha } = require("../controllers/smtpController")
const { tratarMensagensDeErro } = require("../utils/errorMsg")
const { validarDataToken } = require("../middleware/auth")

// esta rota é para enviar o e-mail e o token
router.post('/recuperarSenha', async (req, res) => {

    try {
        const email = req.body.email
        console.log(req.body)
        await enviarEmailRedefinirSenha(email)
        res.status(200).json({ msg: "E-mail com recuperação gerado", statusCode: 200 })
    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })

    }
})


router.post('/definirSenha/:token', async (req, res) => {

    try {
        const token = req.params.token
        const senha = req.body.senha
        
        await validarDataToken(token)

        const tokenDecodificado = jwt.decode(token)
        const email = tokenDecodificado.sub
        
        await redefinirSenha(email, senha, token)
        res.status(200).json({ msg: "Senha atualizada com sucesso ", statusCode: 200 })
    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })

    }

})

module.exports = router