const router = require("express").Router()
const { cadastrarFuncionario, pesquisarTodosFuncionarios, pesquisarUnicoFuncionario, editarFuncionario, loginFuncionario, deslogarFuncionario } = require("../controllers/funcionarioController")
const {tratarMensagensDeErro} = require("../utils/errorMsg")
const { object, string, number } = require('zod')
const authMiddleware = require("../middleware/auth")

const funcionarioValidacao = object({
    NIF: string().min(1).max(20),
    nome: string().min(1).max(50),
    email: string().email().max(100),
    nivel_acesso: number().min(1).max(3)
});

router.post("/login",async(req,res) => {


    try {
        const {email, senha } = req.body
      
        const funcionario = {email,senha}
        
        const response = await loginFuncionario(funcionario)
        !!response == true
        ?res.status(200).json({"statusCode": "200", "msg": "Logado com sucesso" , "response": response})
        :res.status(400).json("Usuario ou senha inválidos")
    }
    catch(err){
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }
})

// ROTAS PROTEGIDAS
router.use(authMiddleware)

router.post("/token", (req,res) =>{

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

        res.status(201).send({"msg": "Funcionario cadastrado com sucesso" , "statusCode": "201"})
    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })

    }
  })

router.get('/todos', async (req, res) => {
    try {
        await pesquisarTodosFuncionarios(req.sequelize)
            .then((response) => res.status(200).json({ msg: "Consulta realizada com sucesso", "statusCode": "200", "response":response }))
            .catch((e) => console.log(e))
    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })

    }
})

router.post("/deslogar", async(req,res)=>{

    const {nif, token} = req.funcionario
    try{

        const response = await deslogarFuncionario(nif,token, req.sequelize)
    
        response[0] == 1? res.json({msg: "Usuario deslogado com sucesso", "statusCode": "200"})
        : res.status(500).json({msg: "Erro ao deslogar usuario", "statusCode": "500"})
    
    }
    catch(err){
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })

    }
})

router.get('/:NIF', async (req, res) => {
    const { NIF } = req.params;
    try {
        await pesquisarUnicoFuncionario(NIF,req.sequelize)
            .then((response) => {
                res.status(200).json({ msg: "Consulta realizada com sucesso", "statusCode": 200, "response":response });
            })
            .catch((e) => res.status(400).json({ msg: "Erro ao realizar consulta", "statusCode": 400, errMsg: e }));
    } catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })

    }
});

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

        await editarFuncionario(NIF, funcionarioValidado, req.sequelize)
        res.send('Informações do funcionário atualizadas com sucesso.')
    } catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })

    }
})

module.exports = router