const router = require("express").Router()
const authMiddleware = require("../middleware/auth")
const reservaModel = require("../models/reservaModel")
const {tratarMensagensDeErro} = require("../utils/errorMsg")
const {criarReserva} = require("./../controllers/reservaController")
const dataLocal = require("../utils/data")
const sequelize = require("sequelize")

router.use(authMiddleware)

router.post("/criar", async(req, res) => {
    
    const {fk_aluno, fk_produto, quantidade} = req.body
    const dataRetirada = new Date(req.body.retirada)
    const reserva = {fk_aluno, fk_produto, quantidade, dataRetirada}
    try {

        const response = await criarReserva(reserva, req.sequelize)
        res.status(201).json({ "msg": `reserva criada: ${response}`, "statusCode": 201, "response": response })


    } catch (err) {
    }
    // console.log(reserva)
})

router.get("/reservas", async (req, res) =>{
    try {

        // pesquisar todas reservas
        
    } catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    
    }
})

router.get("/reserva", async (req, res) =>{
    const {id_reserva, fk_aluno} = req.body

    
    try {
        // pesquisarUmaReserva

        
    } catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    
    }
})



router.patch("/editar", async (req, res) => {
    const {id_reserva, status} = req.body

    try {
        // atualizar status da reserva entregue/cancelado
        
    } catch (error) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }
})

module.exports = router