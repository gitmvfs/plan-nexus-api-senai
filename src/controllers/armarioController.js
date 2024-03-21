const armarioModel = require("../models/armarioModel")

function atualizarArmario(numeroArmario, cpf, statusArmario) {

    return new Promise(async (resolve, reject) => {

        try {
            await armarioModel.update(
                {
                    fk_CPF: cpf,
                    status: statusArmario
                },
                {
                    where: {
                        numero: numeroArmario
                    }
                })
                .then((r) => resolve(r))
                .catch((e) => reject(e))

        }
        catch(err){
            reject(err)
        }

    })

}
atualizarArmario("1", "12345678911", "2")
.then((r)=> console.log(r))
.catch((e) => console.log(e))
// module.exports = {alterarArmario}

