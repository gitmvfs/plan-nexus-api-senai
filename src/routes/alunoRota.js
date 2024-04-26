const router = require("express").Router()
const { cadastroMultiplosAlunos, atualizarAluno, cadastroUnicoAluno, pesquisaUnicoAluno, pesquisaTodosAlunos } = require("../controllers/alunoController")
const { cadastroMultiplosTelefones, cadastroUnicoTelefone } = require("../controllers/contatoController")
const { cadastroDeTurmas } = require("../controllers/cursoController")
const authMiddleware = require("../middleware/auth")
const { tratarMensagensDeErro } = require("../utils/errorMsg")
const excelToJson = require("../utils/excelParseJson")
const { uploadArquivoAlunos } = require("../utils/salvarExcel")
const { alunoUnicoValidacao } = require("../utils/validacao")
const auditoriaMiddleware = require("../middleware/auditoriaMiddleware")

// ROTAS PROTEGIDAS
router.use(authMiddleware)
router.post("/cadastro/multiplos", uploadArquivoAlunos.single("alunosFile"), async (req, res, next) => {

    try {
        const listaALunos = await excelToJson(req.file.path) // pega o arquivo do excel e devolve os alunos em json
        await cadastroDeTurmas(listaALunos, req.sequelize) // pega o json dos alunos e cadastra as turmas
        const resultadoCadastroAlunos = await cadastroMultiplosAlunos(listaALunos, req.sequelize)
        const errosAoCadastrarContato = await cadastroMultiplosTelefones(resultadoCadastroAlunos, req.sequelize)
        resultadoCadastroAlunos.erroCadastroContato = errosAoCadastrarContato
        
        const dadosAuditoria = {
            fk_funcionario: req.funcionario.NIF,
            descricao: "Alunos cadastrados com sucesso",
            operacao: "cadastro de alunos",
            resultado: 200,
            data : Date.now(),
            response : resultadoCadastroAlunos
        }

        auditoriaMiddleware(req, res, next, dadosAuditoria)
    }
    catch (err) {
        console.log(err)
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }
})

router.post("/cadastro/unico", async (req, res, next) => {

    const { CPF, nome, email, fk_curso, socioAapm, telefone, celular } = req.body

    //Dados que chegam da rota
    const aluno = {
        CPF,
        nome,
        email,
        fk_curso,
        socioAapm,
        telefone,
        celular
    }

    try {
        const alunoValidado = alunoUnicoValidacao.parse(aluno)
        const response = await cadastroUnicoAluno(alunoValidado, req.sequelize)
        const errosAoCadastrarContato = await cadastroUnicoTelefone(response, req.sequelize)
        response.erroCadastroContato = errosAoCadastrarContato
       
        const dadosAuditoria = {
            fk_funcionario: req.funcionario.NIF,
            descricao: "Aluno cadastrado com sucesso",
            operacao: "cadastro de aluno único",
            resultado: 200,
            data : Date.now(),
            response : response
        }

        auditoriaMiddleware(req, res, next, dadosAuditoria)

    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }
})

router.patch("/atualizar", async (req, res, next) => {

    const { CPF, email, dados } = req.body

    try {
        const response = await atualizarAluno(CPF, email, dados)

        const dadosAuditoria = {
            fk_funcionario: req.funcionario.NIF,
            descricao: "Aluno atualizado com sucesso",
            operacao: "edição de aluno",
            resultado: 200,
            data : Date.now(),
            response : response
        }

        response[0] == 1
            ? auditoriaMiddleware(req,res,next,dadosAuditoria)
            : res.status(400).json({ "msg": "Erro ao atualizar aluno, verifique os campos.", "statusCode": 400 })

    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }
})

router.get("/unico", async (req, res, next) => {

    const { CPF, email } = req.body

    try {
        const response = await pesquisaUnicoAluno(CPF, email, req.sequelize)
        const dadosAuditoria = {
            fk_funcionario: req.funcionario.NIF,
            descricao: "Aluno encontrado",
            operacao: "ver um aluno",
            resultado: 200,
            data : Date.now(),
            response : response
        }

        auditoriaMiddleware(req, res, next, dadosAuditoria)
    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })

    }

})

router.get("/todos", async (req, res, next) => {

    try {
         const response = await pesquisaTodosAlunos(req.sequelize)

        const dadosAuditoria = {
            fk_funcionario: req.funcionario.NIF,
            descricao: "Alunos encontrados com sucesso",
            operacao: "ver alunos",
            resultado: 200,
            data : Date.now(),
            response 
        }

        auditoriaMiddleware(req, res, next, dadosAuditoria)
    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })

    }
})

module.exports = router