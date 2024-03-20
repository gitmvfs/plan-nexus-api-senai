const router = require("express").Router()
const { cadastroAlunos, atualizarAluno } = require("../controllers/alunoController")
const { cadastroDeTurmas } = require("../controllers/cursoController")
const excelToJson = require("../utils/excelParseJson")
const { uploadArquivoAlunos } = require("../utils/salvarExcel")

router.post("/cadastrar/multiplos", uploadArquivoAlunos.single("alunosFile"), async (req, res) => {

    const listaALunos = await excelToJson(req.file.path) // pega o arquivo do excel e devolve os alunos em json
    await cadastroDeTurmas(listaALunos) // pega o json dos alunos e cadastra as turmas
    const resultadoCadastro = await cadastroAlunos(listaALunos)
    res.json({ msg: "Operação realizada", "statusCode": "200", resultadoCadastro: resultadoCadastro })

})

router.patch("/atualizar", async(req, res) => {

    const {CPF , email , dados} = req.body

    const response = await atualizarAluno(CPF, email, dados)

    response[0] == 1
    ? res.json({"msg": "Atualizado com sucesso", "statudCode" : 200}).status(200)
    : res.json({"msg" : "Erro ao atualizar", "statusCode" : 500}).status(500)
    
})

module.exports = router