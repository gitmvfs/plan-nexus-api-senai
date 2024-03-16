const router = require("express").Router()
const cadastroAlunos = require("../controllers/alunoController")
const { cadastroDeTurmas } = require("../controllers/cursoController")
const excelToJson = require("../utils/excelParseJson")
const { uploadArquivoAlunos } = require("../utils/salvarExcel")

router.post("/cadastrar/multiplos", uploadArquivoAlunos.single("alunosFile"), async (req, res) => {

    const listaALunos = await excelToJson(req.file.path) // pega o arquivo do excel e devolve os alunos em json
    await cadastroDeTurmas(listaALunos) // pega o json dos alunos e cadastra as turmas
    const resultadoCadastro = await cadastroAlunos(listaALunos)
    res.json({msg:"Operação realizada", "statusCode" : "200" , resultadoCadastro: resultadoCadastro })

})


module.exports = router