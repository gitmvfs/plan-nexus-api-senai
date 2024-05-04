const { novoErro } = require("../utils/errorMsg")

function verTodosAssociados(sequelize){
    return new Promise(async(resolve, reject) => {
        try {
            await sequelize.query("select * from todos_associados order by nome")
            .then((r) => {resolve(r[0])})
            .catch((e) => {reject(e)})
        } catch (error) {
            reject(error)
        }
    })
}

function pesquisarUmAssociado(fk_aluno, sequelize){
    return new Promise(async(resolve, reject) => {
        try {
                
                await sequelize.query("select * from todos_associados where fk_aluno = ?", {
                replacements: [fk_aluno],
                type: sequelize.QueryTypes.SELECT
            })
            .then((r) => {resolve(r[0])})
            .catch((e) => {reject(e)})

        } catch (error) {
            reject(error)
        }
    })
}

function associarAluno(associacao, sequelize){
    return new Promise(async(resolve, reject) => {
        try {
            const {id_aluno, brinde, dataAssociacao: data_associacao} = associacao

            const associadoExiste = await pesquisarUmAssociado(id_aluno, sequelize)

            associadoExiste ? novoErro("aluno ja e associado", 400) :
            await sequelize.query("call associar_aluno(?,?,?)", {
                replacements: [id_aluno, brinde, data_associacao],
                type: sequelize.QueryTypes.INSERT
            })
                .then((r) => { resolve(r) })
                .catch((e) => { reject(e) })
             
            
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = { verTodosAssociados, associarAluno }