const router = require("express").Router()
const { tratarMensagensDeErro } = require("../utils/errorMsg")
const authMiddleware = require("../middleware/auth")
const { verTodasDoacoes, cadastroDoacaoProduto, editarDoacaoProduto } = require("../controllers/doacaoProdutoController")

router.use(authMiddleware)

router.get("/todas", async(req, res) => {
    
    try {
        const response = await verTodasDoacoes(req.sequelize)
        res.status(200).json({ "msg": "consulta realizada com sucesso",  "status": "200", "response": response })
        

    } catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }

})

router.post("/cadastro", async(req, res) => {
    try {
        const {idAluno, idProduto, quantidade, contrato} = req.body
        const data = new Date(req.body.data)
        const doacaoProduto = {idAluno, idProduto, quantidade, contrato, data}

        await cadastroDoacaoProduto(doacaoProduto, req.sequelize)
        res.status(201).send({'msg': 'Doação de produto criada com sucesso', 'status': "201"})
    } catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }
})

router.patch("/atualizar", async(req, res) => {
    try {
        const {idDoacao, idAluno, idProduto, quantidade} = req.body
        const data = new Date(req.body.data)
        const dadosDoacao = {idDoacao, idAluno, idProduto, quantidade, data}

        await editarDoacaoProduto(dadosDoacao, req.sequelize)
        res.status(200).json({'msg': 'doação atualizada com sucesso', 'statusCode': 200})

    } catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })

    }
})

module.exports = router