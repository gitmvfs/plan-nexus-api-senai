const router = require("express").Router()
const { cadastrarFuncionario, pesquisarTodosFuncionarios, pesquisarUnicoFuncionario, editarFuncionario, loginFuncionario, deslogarFuncionario, inativarFuncionario } = require("../controllers/funcionarioController")
const { tratarMensagensDeErro } = require("../utils/errorMsg")
const { object, string, number } = require('zod')
const {authMiddleware} = require("../middleware/auth_funcionario")
const { funcionarioValidacao } = require("../utils/validacao")
const { uploadImagem } = require("../utils/multer")

router.post("/login", async (req, res) => {


    try {
        const { email, senha } = req.body

        const funcionario = { email, senha }

        const response = await loginFuncionario(funcionario)
        !!response == true
            ? res.status(200).json({ "statusCode": "200", "msg": "Logado com sucesso", "response": response })
            : res.status(400).json("Usuario ou senha inválidos")
    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }
})

// ROTAS PROTEGIDAS
router.use(authMiddleware)

router.post("/token", (req, res) => {

    res.json(true)

})

router.post('/', async (req, res) => {
    const { NIF, nome, email, nivel_acesso } = req.body

    const funcionario = {
        NIF,
        nome,
        email,
        nivel_acesso
    }

    try {
        const funcionarioValidado = funcionarioValidacao.parse(funcionario)

        await cadastrarFuncionario(funcionarioValidado, req.sequelize)

        res.status(201).send({ "msg": "Funcionario cadastrado com sucesso", "statusCode": "201" })
    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })

    }
})

router.get('/todos', async (req, res) => {
    try {
        await pesquisarTodosFuncionarios(req.sequelize)
            .then((response) => res.status(200).json({ msg: "Consulta realizada com sucesso", "statusCode": "200", "response": response }))
            .catch((e) => console.log(e))
    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })

    }
})
router.post("/deslogar", async (req, res) => {

    const { nif, token } = req.funcionario
    try {

        const response = await deslogarFuncionario(nif, token, req.sequelize)

        res.json({ msg: "Usuario deslogado com sucesso", "statusCode": "200" })

    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })

    }
})

router.get('/unico/:NIF', async (req, res) => {
    try {
        const { NIF } = req.params;
        const response = await pesquisarUnicoFuncionario(NIF, req.sequelize)

        !!response[0] == true
            ? res.status(200).json({ msg: "Consulta realizada com sucesso", "statusCode": "200", "response": response })
            : res.status(200).json({ msg: "Usuario não encontrado", "statusCode": "404" })
    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })

    }
});

router.patch('/atualizar', uploadImagem.single("fotoFuncionario"), async (req, res) => {

    try {
        const { idFuncionario, nome, email, NIF, nivel_acesso } = req.body

        // Verifica se o link de foto está vazio e define como undefined
        const foto = req.file || null

        // Verifica se o link da foto foi passado, caso contrario foto = null

        const dadosFuncionario = {
            idFuncionario,
            NIF,
            nome,
            email,
            nivel_acesso
        }

        const funcionarioValidado = funcionarioValidacao.parse(dadosFuncionario)
        await editarFuncionario(funcionarioValidado, foto, req.sequelize)
        res.json({ msg: "Atualização realizada com sucesso", "statusCode": 200 })
    } catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })

    }
})

router.patch('/inativar/:NIF', async (req, res) => {
    try {
        const { NIF } = req.params

        const response = await inativarFuncionario(NIF, req.sequelize)
        res.json({ msg: "funcionario inativado com sucesso", "statusCode": 200, "response": response })

    } catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }
})

module.exports = router
