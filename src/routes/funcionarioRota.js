const router = require("express").Router()
const { cadastrarFuncionario, editarFuncionario, loginFuncionario } = require("../controllers/funcionarioController")
const { object, string, number } = require('zod')
const authMiddleware = require("../middleware/auth")

const funcionarioValidacao = object({
    NIF: string().min(1).max(20),
    nome: string().min(1).max(50),
    email: string().email().min(1).max(100),
    nivel_acesso: number().min(1).max(10)
});

router.post("/login",async(req,res) => {


    try {
        const {email, senha } = req.body
      
        const funcionario = {email,senha}
        
        const response = await loginFuncionario(funcionario)
        !!response == true
        ?res.status(200).json(response)
        :res.status(400).json("Usuario ou senha inválidos")
    }
    catch(err){
        const status = err.status?? 500 
        const msg = err.issues ?? err.message 

        console.log(err)
        res.status(status).json(msg)
    }
})

// ROTAS PROTEGIDAS
router.use(authMiddleware)


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