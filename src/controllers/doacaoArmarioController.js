function cadastroDoacaoArmario(doacaoArmario, sequelize) {

    return new Promise((resolve, reject) => {

        try {
            const {numeroArmario, idAluno, data } = doacaoArmario

            sequelize.query("call doar_armario(?,?,?)", {
                replacements: [  idAluno,numeroArmario, data],
                type: sequelize.QueryTypes.INSERT
            })
                .then(r => resolve(r))
                .catch(e => reject(e));


        }
        catch (err) {
            reject(err)
        }
    })
}

module.exports = {cadastroDoacaoArmario}