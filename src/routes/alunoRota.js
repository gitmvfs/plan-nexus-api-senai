const router = require("express").Router()
const { cadastroMultiplosAlunos, atualizarAluno, cadastroUnicoAluno, pesquisaUnicoAluno } = require("../controllers/alunoController")
const { cadastroDeTurmas } = require("../controllers/cursoController")
const tratarMensagensDeErro = require("../utils/errorMsg")
const excelToJson = require("../utils/excelParseJson")
const { uploadArquivoAlunos } = require("../utils/salvarExcel")
const { alunoUnicoValidacao } = require("../utils/validacao")

router.post("/cadastro/multiplos", uploadArquivoAlunos.single("alunosFile"), async (req, res) => {

    try {
        const listaALunos = await excelToJson(req.file.path) // pega o arquivo do excel e devolve os alunos em json
        await cadastroDeTurmas(listaALunos) // pega o json dos alunos e cadastra as turmas
        const resultadoCadastro = await cadastroMultiplosAlunos(listaALunos)
        res.status(200).json({ msg: "Operação realizada", "statusCode": "200", resultadoCadastro: resultadoCadastro })

    }
    catch (err) {
        const errMsg = tratarMensagensDeErro(err)
        res.status(500).json({ errMsg: errMsg, "statusCode": 500 })
    }
})

router.post("/cadastro/unico", async (req, res) => {

    const { CPF, nome, email, fk_curso, socioAapm } = req.body

    //Dados que chegam da rota
    const aluno = {
        CPF,
        nome,
        email,
        fk_curso,
        socioAapm
    }

    try {
        const alunoValidado = alunoUnicoValidacao.parse(aluno)

        const response = await cadastroUnicoAluno(alunoValidado)
        !!response == true
            ? res.status(201).json({ "msg": "cadastrado com sucesso", "statusCode": 201 })
            : res.status(500).json({ "msg": "Erro ao cadastrar", "statusCode": 500 })

    }
    catch (err) {
        const errMsg = tratarMensagensDeErro(err)
        res.status(400).json({ errMsg: errMsg, "statusCode": 400 })
    }
})

router.patch("/atualizar", async (req, res) => {

    const { CPF, email, dados } = req.body

    try {
        const response = await atualizarAluno(CPF, email, dados)

        response[0] == 1
            ? res.status(200).json({ "msg": "Atualizado com sucesso", "statusCode": 200 })
            : res.status(400).json({ "msg": "Erro ao atualizar aluno, verifique os campos.", "statusCode": 400 })

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
            .then((resposta) => res.status(200).json({ msg: "Consulta realizada com sucesso", "statusCode": 200, data: resposta }))
            .catch((e) => res.status(400).json({ msg: "Erro ao realizar consulta", "statusCode": 400, errMsg: e }))
    }
    catch (err) {
        const errMsg = tratarMensagensDeErro(err)
        res.status(500).json({ errMsg: errMsg, "statusCode": 500 })

    }

})

module.exports = router