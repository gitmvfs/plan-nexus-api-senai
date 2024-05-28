const router = require("express").Router()
const { response } = require("express")
const { cadastroMultiplosAlunos, atualizarAluno, cadastroUnicoAluno, pesquisaAluno, pesquisaTodosAlunos } = require("../controllers/alunoController")
const { cadastroDeTurmas } = require("../controllers/cursoController")
const authMiddleware = require("../middleware/auth")
const { tratarMensagensDeErro } = require("../utils/errorMsg")
const excelToJson = require("../utils/excelParseJson")
const { uploadArquivoAlunos, uploadImagem } = require("../utils/multer")
const { alunoUnicoValidacao } = require("../utils/validacao")
const { retirarFormatacao } = require("../utils/converterString")

// ROTAS PROTEGIDAS
router.use(authMiddleware)
router.post("/cadastro/multiplos", uploadArquivoAlunos.single("alunosFile"), async (req, res) => {

    try {
        const listaALunos = await excelToJson(req.file.path) // pega o arquivo do excel e devolve os alunos em json
        await cadastroDeTurmas(listaALunos, req.sequelize) // pega o json dos alunos e cadastra as turmas
        const resultadoCadastroAlunos = await cadastroMultiplosAlunos(listaALunos, req.sequelize)

        let statusCode = 201
        let mensagemResposta = "Operação realizada com sucesso"
        if (!!resultadoCadastroAlunos.alunosCadastrados[0] == false) {
            statusCode = 400 // caso tenha apenas erros na hora da inserção
            mensagemResposta = "Todos os dados já estão cadastrados, verifique se o arquivo está correto."
        }


        res.status(statusCode).json({ msg: `${mensagemResposta}`, "statusCode": `${statusCode}`, "response": resultadoCadastroAlunos })
    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }
})

router.post("/cadastro/unico", async (req, res) => {

    const { CPF, nome, email, fk_curso, socioAapm, telefone, celular } = req.body

    //Dados que chegam da rota
    const aluno = {
        CPF: retirarFormatacao(CPF),
        nome,
        email,
        fk_curso,
        socioAapm,
        telefone: retirarFormatacao(telefone),
        celular: retirarFormatacao(celular)
    }

    try {
        const alunoValidado = alunoUnicoValidacao.parse(aluno)
        const response = await cadastroUnicoAluno(alunoValidado, req.sequelize)
        res.status(201).json({ "msg": "cadastrado com sucesso", "statusCode": 201, "response": response })

    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }
})

router.patch("/atualizar", uploadImagem.single("fotoAluno"), async (req, res) => {


    try {
        const { idAluno, CPF, nome, email, socioAapm, fk_curso, telefone, celular } = req.body

        const foto = req.file || null


        //Dados que chegam da rota
        const aluno = {
            idAluno,
            CPF,
            nome,
            socioAapm,
            email,
            fk_curso,
            telefone,
            celular
        }

        alunoUnicoValidacao.parse(aluno)
        const response = await atualizarAluno(aluno, foto, req.sequelize)

        response
            ? res.status(200).json({ "msg": "Atualizado com sucesso", "statusCode": 200, "response: ": response })
            : res.status(400).json({ "msg": "Erro ao atualizar aluno, verifique os campos.", "statusCode": 400 })

    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }
})

router.get("/unico/:idAluno", async (req, res) => {

    try {
        const { idAluno } = req.params

        const response = await pesquisaAluno(idAluno, req.sequelize)
        res.status(200).json({ "msg": "Consulta realizada com sucesso", "statusCode": 200, "response": response })

    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })

    }

})

router.get("/todos", async (req, res) => {

    try {
        await pesquisaTodosAlunos(req.sequelize)
            .then((response) => res.status(200).json({ msg: "Consulta realizada com sucesso", "statusCode": 200, "response": response }))
            .catch((e) => res.status(400).json({ msg: "Erro ao realizar consulta", "statusCode": 400, errMsg: e }))
    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })

    }
})

module.exports = router