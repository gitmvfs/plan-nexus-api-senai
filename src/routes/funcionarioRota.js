const router = require("express").Router()
const { cadastrarFuncionario, editarFuncionario, pesquisarTodosFuncionarios } = require("../controllers/funcionarioController")
const { object, string, number } = require('zod')

const funcionarioValidacao = object({
    NIF: string().min(1).max(20),
    nome: string().min(1).max(50),
    email: string().email().max(100),
    nivel_acesso: number().min(1).max(3)
});

router.post('/', async (req, res) => {
    const { NIF, nome, email, fk_nivel_acesso } = req.body

    const funcionario = {
        NIF,
        nome,
        email,
        nivel_acesso: fk_nivel_acesso
    }

    try {
        const funcionarioValidado = funcionarioValidacao.parse(funcionario)

        await cadastrarFuncionario(funcionarioValidado)

        res.send('Funcionário cadastrado com sucesso.')
    }
    catch (err) {
        res.status(500).send(err)
    }
  })

router.put('/:NIF', async (req, res) => {
    const { NIF } = req.params
    const { nome, email, fk_nivel_acesso } = req.body

    const novosDados = {
        NIF,
        nome,
        email,
        nivel_acesso: fk_nivel_acesso
    }

    try {
        const funcionarioValidado = funcionarioValidacao.parse(novosDados)

        await editarFuncionario(NIF, funcionarioValidado)
        res.send('Informações do funcionário atualizadas com sucesso.')
    } catch (err) {
        res.status(500).send(err)
    }
})

router.get('/', async (req, res) => {
    try {
        await pesquisarTodosFuncionarios()
            .then((resposta) => res.status(200).json({ msg: "Consulta realizada com sucesso", "statusCode": 200, data: resposta }))
            .catch((e) => res.status(400).json({ msg: "Erro ao realizar consulta", "statusCode": 400, errMsg: e }))
    }
    catch (err) {
        res.status(500).json({ errMsg: err, "statusCode": 500 })
    }
})

module.exports = router