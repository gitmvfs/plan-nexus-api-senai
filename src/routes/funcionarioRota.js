const router = require("express").Router()
const { cadastrarFuncionario, editarFuncionario } = require("../controllers/funcionarioController")
const { object, string, number } = require('zod')

const funcionarioValidacao = object({
    NIF: string().min(1).max(20),
    nome: string().min(1).max(50),
    email: string().email().min(1).max(100),
    nivel_acesso: number().min(1).max(10)
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

module.exports = router