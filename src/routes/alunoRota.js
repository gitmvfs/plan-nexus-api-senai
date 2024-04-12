const router = require("express").Router()
const { cadastroMultiplosAlunos, atualizarAluno, cadastroUnicoAluno, pesquisaUnicoAluno, pesquisaTodosAlunos } = require("../controllers/alunoController")
const { cadastroDeTurmas } = require("../controllers/cursoController")
const authMiddleware = require("../middleware/auth")
const { tratarMensagensDeErro } = require("../utils/errorMsg")
const excelToJson = require("../utils/excelParseJson")
const { uploadArquivoAlunos } = require("../utils/salvarExcel")
const { alunoUnicoValidacao } = require("../utils/validacao")

// ROTAS PROTEGIDAS
router.use(authMiddleware)
router.post("/cadastro/multiplos", uploadArquivoAlunos.single("alunosFile"), async (req, res) => {

    try {
        const listaALunos = await excelToJson(req.file.path) // pega o arquivo do excel e devolve os alunos em json
        await cadastroDeTurmas(listaALunos, req.sequelize) // pega o json dos alunos e cadastra as turmas
        const resultadoCadastro = await cadastroMultiplosAlunos(listaALunos, req.sequelize)
        res.status(200).json({ msg: "Operação realizada", "statusCode": "200", response: resultadoCadastro })
    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        console.log(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
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

        const response = await cadastroUnicoAluno(alunoValidado, req.sequelize)

        res.status(201).json({ "msg": "cadastrado com sucesso", "statusCode": 201, ...response })

    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
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
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }
})

router.get("/unico", async (req, res) => {

    const { CPF, email } = req.body

    try {
        await pesquisaUnicoAluno(CPF, email, req.sequelize)
            .then((response) => res.status(200).json({ msg: "Consulta realizada com sucesso", "statusCode": 200, ...response }))
            .catch((e) => res.status(400).json({ msg: "Erro ao realizar consulta", "statusCode": 400, errMsg: e }))
    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })

    }

})

router.get("/todos", async (req, res) => {


    const { CPF, email } = req.body

    try {
        await pesquisaTodosAlunos(req.sequelize)
            .then((response) => res.status(200).json({ msg: "Consulta realizada com sucesso", "statusCode": 200, ...response }))
            .catch((e) => res.status(400).json({ msg: "Erro ao realizar consulta", "statusCode": 400, errMsg: e }))
    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })

    }
})

module.exports = router