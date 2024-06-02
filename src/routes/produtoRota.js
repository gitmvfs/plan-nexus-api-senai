const router = require("express").Router()
const { cadastrarProduto, pesquisarTodosProdutos, pesquisarProdutoPeloId, definirEstoqueProduto, pesquisarProdutosUnicos, trocarProdutoBrinde, atualizarProduto } = require("../controllers/produtoController")
const {authMiddleware} = require("../middleware/auth_funcionario")
const { produtoValidacao } = require("../utils/validacao")
const { tratarMensagensDeErro, novoErro } = require("../utils/errorMsg")
const { uploadImagem } = require("../utils/multer")
const { array } = require("zod")

router.use(authMiddleware)

router.post("/", uploadImagem.any(), async (req, res) => {
    try {
        const { nome, descricao } = req.body

        // define a lista de cores e tamanhos
        const cores = req.body.cores instanceof Array == true ? req.body.cores : new Array(req.body.cores) //verifica se é um array ou uma string unica
        const tamanhos = req.body.tamanhos instanceof Array == true ? req.body.tamanhos : new Array(req.body.tamanhos)
        const valor = Number(req.body.valor)
        const brinde = req.body.brinde
        const imagensAgrupadas = req.files
        const desconto = Number(req.body.desconto)
        // caso req.files esteja vazio
        
        const produto = {
            nome,
            cores,
            tamanhos,
            desconto,
            valor,
            descricao,
            brinde
        }

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

router.get("/unico/", async (req, res) => {

    try {

        const response = await pesquisarProdutosUnicos(req.sequelize)
            .then((response) => res.status(200).json({ msg: "Consulta realizada com sucesso", "statusCode": 200, "response": response }))


    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })

    }


})

router.get("/:idProduto", async (req, res) => {

    try {
        const response = await pesquisarProdutoPeloId(req.params.idProduto, req.sequelize)
        !!response[0] == true
            ? res.status(200).json({ msg: "Consulta realizada com sucesso", "statusCode": 200, "response": response })
            : res.status(404).json({ msg: "Produto não encontrado", "statusCode": 404, })
    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })

    }

})

router.patch("/estoque", async (req, res) => {

    try {
        const { idProduto, quantidade } = req.body
        const response = await definirEstoqueProduto(idProduto, quantidade, req.sequelize)
        res.status(200).json({ msg: "Estoque atualizado com sucesso", "statusCode": 200 })
    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })

    }

})


router.patch("/editar", uploadImagem.any(), async (req, res) => {

    try {
        const { idProduto, nome, cor, brinde, tamanho, descricao, } = req.body
        const valor = Number(req.body.valor)
        const desconto = Number(req.body.desconto)
        const fotos = req.files
        const linksFotosAntigas = req.body.linksFotosAntigas || []

        const produto = {
            nome,
            descricao,
            cor,
            valor,
            foto:linksFotosAntigas,
            tamanho,
            desconto_associado : desconto,
            brinde
        }
        // adicionar fotos futuramente
        const response = await atualizarProduto(idProduto, produto, fotos, req.sequelize)
        res.status(200).json({ msg: "Produto atualizado com sucesso", "statusCode": 200 })
    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })

    }
})

router.patch("/trocarBrinde", async (req, res) => {

    try {
        const listaIdProduto = req.body.listaIdProduto instanceof Array == true ? req.body.listaIdProduto : Array(req.body.listaIdProduto)
        await trocarProdutoBrinde(listaIdProduto, req.sequelize)
        res.status(200).json({ msg: "Brinde atualizado com sucesso", "statusCode": 200 })

    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })

    }



})

module.exports = router
