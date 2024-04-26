const router = require("express").Router()
const { cadastrarFuncionario, pesquisarTodosFuncionarios, pesquisarUnicoFuncionario, editarFuncionario, loginFuncionario, deslogarFuncionario } = require("../controllers/funcionarioController")
const {tratarMensagensDeErro} = require("../utils/errorMsg")
const { object, string, number } = require('zod')
const authMiddleware = require("../middleware/auth")
const auditoriaMiddleware = require("../middleware/auditoriaMiddleware")

const funcionarioValidacao = object({
    NIF: string().min(1).max(20),
    nome: string().min(1).max(50),
    email: string().email().max(100),
    nivel_acesso: number().min(1).max(3)
});

router.post("/login",async(req,res,next) => {


    try {
        const {email, senha } = req.body
      
        const funcionario = {email, senha}
        
        const response = await loginFuncionario(funcionario)
            // console.log(response)
            
        const dadosAuditoria = {
            fk_funcionario: response.NIF,
            descricao: "Usuario logado com sucesso",
            operacao: "login",
            resultado: 200,
            data : Date.now(),
            response
        }
        
        !!response == true
        ?auditoriaMiddleware(req,res,next,dadosAuditoria)
        :res.status(400).json("Usuario ou senha inválidos")
    }
    catch(err){
        console.log(err)
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }
})

// ROTAS PROTEGIDAS
router.use(authMiddleware)

router.post("/token", (req,res) =>{

    res.json(true)

})

router.post('/', async (req, res, next) => {
    const { NIF, nome, email, nivel_acesso } = req.body

    const funcionario = {
        NIF,
        nome,
        email,
        nivel_acesso
    }

    try {
        const funcionarioValidado = funcionarioValidacao.parse(funcionario)

        const response = await cadastrarFuncionario(funcionarioValidado, req.sequelize)

        const dadosAuditoria = {
            fk_funcionario: req.funcionario.NIF,
            descricao: "Usuario cadastrado com sucesso",
            operacao: "cadastro",
            resultado: 200,
            data : Date.now(),
            response : response
        }
        auditoriaMiddleware(req,res,next,dadosAuditoria)
        
    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })

    }
  })

router.get('/todos', async (req, res, next) => {
    try {
        const response = await pesquisarTodosFuncionarios(req.sequelize)
        const dadosAuditoria = {
            fk_funcionario: req.funcionario.NIF,
            descricao: "Consulta realizada com sucesso",
            operacao: "ver todos funcionários",
            resultado: 200,
            data : Date.now(),
            response : response
        }
            
        auditoriaMiddleware(req,res,next,dadosAuditoria)
    }
    catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })

    }
})

router.post("/deslogar", async(req,res, next)=>{

    const {nif, token} = req.funcionario
    try{

        const response = await deslogarFuncionario(nif,token, req.sequelize)
        const dadosAuditoria = {
            fk_funcionario: response.NIF,
            descricao: "Usuario deslogado",
            operacao: "sign out",
            resultado: 200,
            data : Date.now(),
            response : response
        }
  
        auditoriaMiddleware(req, res, next, dadosAuditoria)

    
    }
    catch(err){
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })

    }
})

router.get('/:NIF', async (req, res, next) => {
    const { NIF } = req.params;
    try {
        const response = await pesquisarUnicoFuncionario(NIF,req.sequelize)
        const dadosAuditoria = {
            fk_funcionario: req.funcionario.NIF,
            descricao: "Usuario encontrado com sucesso",
            operacao: "pesquisar um funcionário",
            resultado: 200,
            data : Date.now(),
            response : response
        }

        auditoriaMiddleware(req, res, next, dadosAuditoria)
    } catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })

    }
});

router.patch('/:NIF', async (req, res, next) => {
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

        const response = await editarFuncionario(NIF, funcionarioValidado, req.sequelize)
        const dadosAuditoria = {
            fk_funcionario: req.funcionario.NIF,
            descricao: "Usuario atualizado com sucesso",
            operacao: "edição usuário",
            resultado: 200,
            data : Date.now(),
            response : response
        }

        auditoriaMiddleware(res, res, next, dadosAuditoria)
    } catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })

    }
})


module.exports = router