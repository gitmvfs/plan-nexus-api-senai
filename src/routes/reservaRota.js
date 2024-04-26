const router = require("express").Router()
const authMiddleware = require("../middleware/auth")
const reservaModel = require("../models/reservaModel")
const {tratarMensagensDeErro} = require("../utils/errorMsg")
const {criarReserva, pesquisarUmaReserva, cancelarReserva, confirmarReserva, visualizarTodasReservas} = require("./../controllers/reservaController")
const sequelize = require("sequelize")
const auditoriaMiddleware = require("../middleware/auditoriaMiddleware")

router.use(authMiddleware)

router.post("/criar", async(req, res) => {
    
    const {fk_aluno, fk_produto, quantidade} = req.body
    const dataRetirada = new Date(req.body.retirada)
    const reserva = {fk_aluno, fk_produto, quantidade, dataRetirada}

    try {
        const response = await criarReserva(reserva, req.sequelize)
        res.status(201).json({ "msg": `reserva criada: ${response}`, "statusCode": 201, "response": response })
    } catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }

})

router.get("/todas", async (req, res, next) =>{
    try {

        const response = await visualizarTodasReservas(req.sequelize)
        const dadosAuditoria = {
            fk_funcionario: req.funcionario.NIF,
            descricao: "consulta realizada com sucesso",
            operacao: "ver todas as reservas",
            resultado: 200,
            data : Date.now(),
            response : response
        }

        auditoriaMiddleware(req, res, next, dadosAuditoria)
        
    } catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }
})

router.get("/:id_reserva", async (req, res, next) =>{
    const {id_reserva} = req.params
    
    try {
        const response = await pesquisarUmaReserva(id_reserva, req.sequelize)

        const dadosAuditoria = {
            fk_funcionario: req.funcionario.NIF,
            descricao: "reserva encontrada",
            operacao: "ver uma reserva",
            resultado: 200,
            data : Date.now(),
            response : response
        }

        reserva.length === 0
        ? res.status(404).json({ msg: "reserva não encontrada", "statusCode": 404, "response": reserva })
        : auditoriaMiddleware(req, res, next, dadosAuditoria)
        
    } catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    
    }
})


// cancelar reserva
router.patch("/cancelar", async (req, res, next) => {
    const {id_reserva} = req.body

    try {
        const response = await cancelarReserva(id_reserva, req.sequelize)
        
        const dadosAuditoria = {
            fk_funcionario: req.funcionario.NIF,
            descricao: "reserva cancelada com sucesso",
            operacao: "cancelar uma reserva",
            resultado: 200,
            data : Date.now(),
            response : response
        }

        auditoriaMiddleware(req, res, next, dadosAuditoria)
        
    } catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }
})

// efetuar reserva
router.patch("/confirmar", async (req, res, next) => {
    const {id_reserva} = req.body

    try {
        const response = await confirmarReserva(id_reserva, req.sequelize)
        
        const dadosAuditoria = {
            fk_funcionario: req.funcionario.NIF,
            descricao: "reserva entregue ao aluno",
            operacao: "confirmar uma reserva",
            resultado: 200,
            data : Date.now(),
            response : response
        }

        auditoriaMiddleware(req, res, next, dadosAuditoria)

    } catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }
})

module.exports = router