const { authMiddleware_aluno } = require("../middleware/auth_aluno")
const { adicionarItemCarrinho, removerItemCarrinho, retornarItensCarrinho, criarReserva } = require("../controllers/carrinhoComprasController")
const { tratarMensagensDeErro } = require("../utils/errorMsg")
const { loginAluno } = require("../controllers/alunoController")
const { definirTipoPagamento } = require("../utils/converterString")
const router = require("express").Router()


router.post("/login", async (req, res) => {


    try {
        const { email, senha } = req.body

        const aluno = { email, senha }

        const response = await loginAluno(aluno)
        !!response == true
            ? res.status(200).json({ "statusCode": "200", "msg": "Logado com sucesso", "response": response })
            : res.status(400).json("Usuario ou senha inválidos")
    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }
})

// ROTAS PROTEGIDAS ALUNOS

router.patch("/carrinhoCompras/adicionar", authMiddleware_aluno, async (req, res) => {

    try {
        const { idProduto, quantidade } = req.body

        const response = await adicionarItemCarrinho(idProduto, quantidade, req.aluno, req.sequelize)
        res.status(200).json({ "msg": "Carrinho atualizado com sucesso", "statusCode": 200, "response": response })
    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }

})

router.patch("/carrinhoCompras/remover", authMiddleware_aluno, async (req, res) => {

    try {
        const { idProduto } = req.body

        const response = await removerItemCarrinho(idProduto, req.aluno, req.sequelize)
        res.status(200).json({ "msg": "Carrinho atualizado com sucesso", "statusCode": 200, "response": response })
    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }

})

router.get("/carrinhoCompras", authMiddleware_aluno, async (req, res) => {


    try {
        const response = await retornarItensCarrinho(req.aluno, req.sequelize)
        res.status(200).json({ "msg": "Carrinho de compras resgatado com sucesso", "statusCode": 200, "response": response })

    } catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }


})

router.post("/carrinhoCompras", authMiddleware_aluno, async (req, res) => {

    try {
        const data = new Date(req.body.data)
        let tipoPagamento = req.body.tipoPagamento
        const virandoSocio = req.body.virandoSocio
        tipoPagamento = await definirTipoPagamento(tipoPagamento)

        const response = await criarReserva(tipoPagamento, virandoSocio, req.aluno, data)
        res.status(200).json({ "msg": "Reserva gerada com sucesso", "statusCode": 200 })

    } catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }


})

module.exports = router