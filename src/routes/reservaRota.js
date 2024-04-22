const router = require("express").Router()
const authMiddleware = require("../middleware/auth")
const reservaModel = require("../models/reservaModel")
const {tratarMensagensDeErro} = require("../utils/errorMsg")
const {criarReserva, pesquisarUmaReserva, cancelarReserva, confirmarReserva, visualizarTodasReservas} = require("./../controllers/reservaController")
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
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }

})

router.get("/todas", async (req, res) =>{
    try {

        const response = await visualizarTodasReservas(req.sequelize)
        .then((response) => res.status(200).json({ msg: "Consulta realizada com sucesso", "statusCode": "200", "response":response }))
        .catch((e) => console.log(e))
        
    } catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }
})

router.get("/:id_reserva", async (req, res) =>{
    const {id_reserva} = req.params
    
    try {
        const reserva = await pesquisarUmaReserva(id_reserva, req.sequelize)
        reserva.length === 0
        ? res.status(404).json({ msg: "reserva não encontrada", "statusCode": 404, "response": reserva })
        : res.status(200).json({ msg: "reserva encontrada", "statusCode": 200, "response": reserva })
        
    } catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    
    }
})


// cancelar reserva
router.patch("/cancelar", async (req, res) => {
    const {id_reserva} = req.body

    try {
        const response = await cancelarReserva(id_reserva, req.sequelize)
        ?  res.status(400).json({ msg: "não é possível cancelar a reserva", "statusCode": 400})
        :  res.status(200).json({ msg: "reserva cancelada com sucesso", "statusCode": 200})
        
    } catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }
})

// efetuar reserva
router.patch("/confirmar", async (req, res) => {
    const {id_reserva} = req.body

    try {
        await confirmarReserva(id_reserva, req.sequelize)
        ?  res.status(400).json({ msg: "não é possível confirmar a reserva", "statusCode": 400})
        :  res.status(200).json({ msg: "reserva entregue", "statusCode": 200})

    } catch (err) {
        const erroTratado = await tratarMensagensDeErro(err)
        res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
    }
})

module.exports = router
