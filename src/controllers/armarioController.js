const armarioModel = require("../models/armarioModel")

function alterarArmario(numeroArmario,cpf,statusArmario){

    return new Promise((resolve,reject) =>{

        armarioModel.update({
            fk_CPF:cpf,
            status:statusArmario
        })


    })

}

