const router = require("express").Router()
const { cadastroMultiplosAlunos, atualizarAluno, cadastroUnicoAluno, pesquisaUnicoAluno } = require("../controllers/alunoController")
const { cadastroDeTurmas } = require("../controllers/cursoController")
const tratarMensagensDeErro = require("../utils/errorMsg")
const excelToJson = require("../utils/excelParseJson")
const { uploadArquivoAlunos } = require("../utils/salvarExcel")

router.post("/cadastro/multiplos", uploadArquivoAlunos.single("alunosFile"), async (req, res) => {

    try {
        const listaALunos = await excelToJson(req.file.path) // pega o arquivo do excel e devolve os alunos em json
        await cadastroDeTurmas(listaALunos) // pega o json dos alunos e cadastra as turmas
        const resultadoCadastro = await cadastroMultiplosAlunos(listaALunos)
        res.json({ msg: "Operação realizada", "statusCode": "200", resultadoCadastro: resultadoCadastro })

    }
    catch (err) {
        const errMsg = tratarMensagensDeErro(err)
        res.json({ errMsg: errMsg, "statusCode": 500 }).status(500)
    }
})

router.post("/cadastro/unico", async (req, res) => {

    const { CPF, nome, email, fk_curso, socioAapm } = req.body

    const aluno = {
        CPF,
        nome,
        email,
        fk_curso
    }
    try {
        const response = await cadastroUnicoAluno(aluno, socioAapm)

        response[0] == 1
            ? res.json({ "msg": "cadastrado com sucesso", "statudCode": 200 }).status(200)
            : res.json({ "msg": "Erro ao cadastrar", "statusCode": 400 }).status(400)

    }
    catch (err) {
        const errMsg = tratarMensagensDeErro(err)
        res.json({ errMsg: errMsg, "statusCode": 500 }).status(500)
    }
})

router.patch("/atualizar", async (req, res) => {

    const { CPF, email, dados } = req.body

    try {
        const response = await atualizarAluno(CPF, email, dados)

        response[0] == 1
            ? res.json({ "msg": "Atualizado com sucesso", "statusCode": 200 }).status(200)
            : res.json({ "msg": "Erro ao atualizar aluno, verifique os campos.", "statusCode": 400 }).status(400)

    }
    catch (err) {
        const errMsg = tratarMensagensDeErro(err)
        res.json({ errMsg: errMsg, "statusCode": 500 }).status(500)
    }
})

router.get("/unico", async (req, res) => {

    const { CPF, email } = req.body

    try {
        await pesquisaUnicoAluno(CPF, email)
            .then((resposta) => res.json({ msg: "Consulta realizada com sucesso", "statusCode": 200, data: resposta }).status(200))
            .catch((e) => res.json({ msg: "Erro ao realizar consulta", "statusCode": 400, errMsg: e }))
    }
    catch (err) {
        const errMsg = tratarMensagensDeErro(err)
        res.json({ errMsg: errMsg, "statusCode": 500 }).status(500)

    }

})

module.exports = router