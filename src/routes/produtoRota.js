const router = require("express").Router()
const { cadastrarProduto } = require("../controllers/produtoController")
const authMiddleware = require("../middleware/auth")
const {produtoValidacao} = require("../utils/validacao")
const {tratarMensagensDeErro} = require("../utils/errorMsg")
const auditoriaMiddleware = require("../middleware/auditoriaMiddleware")

router.use(authMiddleware)

router.post("/cadastro", async (req,res, next) =>{
    try{
    const {nome,cores,tamanhos,fotos,valor,descricao,brinde } = req.body
  
    const produto = {
        nome,
        cores,
        tamanhos,
        fotos,
        valor,
        descricao,
        brinde
    }

    const produtoValidado = produtoValidacao.parse(produto)
    const response = await cadastrarProduto(produtoValidado,req.sequelize)
    
    const dadosAuditoria = {
        fk_funcionario: req.funcionario.NIF,
        descricao: "produto cadastrado com sucesso",
        operacao: "cadastro de produto",
        resultado: 200,
        data : Date.now(),
        response : response
    }

    auditoriaMiddleware(req, res, next, dadosAuditoria)
}
catch(err){
    const erroTratado = await tratarMensagensDeErro(err)
    res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })

}
})

module.exports = router