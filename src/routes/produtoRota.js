const router = require("express").Router()
const { cadastrarProduto } = require("../controllers/produtoController")
const authMiddleware = require("../middleware/auth")
const { produtoValidacao } = require("../utils/validacao")
const { tratarMensagensDeErro } = require("../utils/errorMsg")
const { uploadProduto, uploadImagem } = require("../utils/multer")
const {salvarImagemAzure, excluirImagemAzure} = require("../controllers/blobController")

router.use(authMiddleware)

router.post("/cadastro",uploadImagem.any() ,async (req, res) => {
    try {
        const { nome, descricao } = req.body
        
        // define a lista de cores e tamanhos
        const cores = req.body.cores.split(",")
        const tamanhos = req.body.tamanhos.split(",")
        const valor =  Number(req.body.valor)
        const brinde = Boolean(req.body.brinde)

        const imagensAgrupadas = req.files

        // console.log(uploadImagem)
        const produto = {
            nome,
            cores,
            tamanhos,
            valor,
            descricao,
            brinde
        }

        // console.log(produto)
        const produtoValidado = produtoValidacao.parse(produto)
        const response = await cadastrarProduto(produtoValidado, imagensAgrupadas,  req.sequelize)
        res.json({"statusCode": 201, "msg": "Produto cadastrado com sucesso" })
    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })

    }
})

module.exports = router
