const router = require("express").Router()
const { cadastrarProduto, pesquisarTodosProdutos, pesquisarUnicoProduto } = require("../controllers/produtoController")
const authMiddleware = require("../middleware/auth")
const { produtoValidacao } = require("../utils/validacao")
const { tratarMensagensDeErro } = require("../utils/errorMsg")
const { uploadImagem } = require("../utils/multer")

router.use(authMiddleware)

router.post("/", uploadImagem.any(), async (req, res) => {
    try {
        const { nome, descricao } = req.body

        // define a lista de cores e tamanhos
        const cores = req.body.cores.split(",")
        const tamanhos = req.body.tamanhos.split(",")
        const valor = Number(req.body.valor)
        const brinde = req.body.brinde
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
        const response = await cadastrarProduto(produtoValidado, imagensAgrupadas, req.sequelize)
        res.json({ "statusCode": 201, "msg": "Produto cadastrado com sucesso" })
    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })

    }
})

router.get("/todos", async (req, res) => {

    try {
        pesquisarTodosProdutos(req.sequelize)
            .then((response) => res.status(200).json({ msg: "Consulta realizada com sucesso", "statusCode": 200, "response": response }))
            .catch((e) => res.status(400).json({ msg: "Erro ao realizar consulta", "statusCode": 400, errMsg: e }))
    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })

    }


})

router.get("/:idProduto", async (req, res) => {

    try {
        const response = await pesquisarUnicoProduto(req.params.idProduto, req.sequelize)
        !!response[0] == true
        ?res.status(200).json({ msg: "Consulta realizada com sucesso", "statusCode": 200, "response": response })
        :res.status(404).json({ msg: "Produto não encontrado", "statusCode": 404,})
    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })

    }

})

router.post("/estoque/", async (req, res) => {

    try {
        const response = await pesquisarUnicoProduto(req.params.idProduto, req.sequelize)
        !!response[0] == true
        ?res.status(200).json({ msg: "Consulta realizada com sucesso", "statusCode": 200, "response": response })
        :res.status(404).json({ msg: "Produto não encontrado", "statusCode": 404,})
    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })

    }

})

module.exports = router
