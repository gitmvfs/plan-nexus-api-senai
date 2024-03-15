const router = require("express").Router()
const { cadastroDeTurmas } = require("../controllers/cursoController")
const excelToJson = require("../utils/excelParseJson")
const { uploadArquivoAlunos } = require("../utils/salvarExcel")

router.post("/cadastrar/multiplos", uploadArquivoAlunos.single("alunosFile"), async(req, res) => {

    const responseJson = await excelToJson(req.file.path) // pega o arquivo do excel e devolve os alunos em json
    cadastroDeTurmas(responseJson) // pega o json dos alunos e cadastra as turmas
    res.json({data:responseJson})

})


module.exports = router