const { reject } = require("bcrypt/promises")
const { novoErro } = require("../utils/errorMsg")

function verTodosAssociados(sequelize) {
    return new Promise(async (resolve, reject) => {
        try {
            await sequelize.query("select * from todos_associados order by nome")
                .then((r) => { resolve(r[0]) })
                .catch((e) => { reject(e) })
        } catch (error) {
            reject(error)
        }
    })
}

function pesquisarUmAssociadoPeloId(fk_aluno, sequelize) {
    return new Promise(async (resolve, reject) => {
        try {
            await sequelize.query("select * from todos_associados where fk_aluno = ?", {
                replacements: [fk_aluno],
                type: sequelize.QueryTypes.SELECT
            })
                .then((r) => { !!r[0] == true ? resolve(r[0]) : reject(novoErro("Aluno não encontrado na base de associados", 404)) })
                .catch((e) => { reject(e) })

        } catch (error) {
            reject(error)
        }
    })
}

function associarAluno(associacao, sequelize) {
    return new Promise(async (resolve, reject) => {
        try {
            const { id_aluno, brinde, dataAssociacao } = associacao
            const associadoExiste = await pesquisarUmAssociadoPeloId(id_aluno, sequelize)

            associadoExiste ? reject(novoErro("aluno ja e associado", 400)) :
                await sequelize.query("call associar_aluno(?,?,?)", {
                    replacements: [id_aluno, brinde, dataAssociacao],
                    type: sequelize.QueryTypes.INSERT
                })
                    .then((r) => { resolve(r) })
                    .catch((e) => { reject(e) })


        } catch (error) {
            reject(error)
        }
    })
}

function removerAssociado(idAluno, sequelize) {

    return new Promise(async (resolve, reject) => {
        try {
            // verifica se o associado existe

            const response = await pesquisarUmAssociadoPeloId(idAluno, sequelize)

            // realiza a operação caso ele exista
            await sequelize.query("call encerrar_associacao(?)", {
                replacements: [idAluno],
                type: sequelize.QueryTypes.DELETE
            })
                .then((r) => { resolve(r) })
                .catch((e) => { reject(e) })

        }
        catch (err) {
            reject(err)
        }
    })

}

function resgatarBrindeAssociado(idAluno, sequelize) {

    return new Promise(async (resolve, reject) => {
        try {
            // verifica se o associado existe

            const response = await pesquisarUmAssociadoPeloId(idAluno, sequelize)
            
            // verifica se o brinde já foi resgatado
            if(response.brinde == 1){
                reject(novoErro("Aluno já resgatou o brinde", 400))
            }

            // realiza a operação caso ele exista
            await sequelize.query("call resgatar_brinde(?)", {
                replacements: [idAluno],
                type: sequelize.QueryTypes.UPDATE
            })
                .then((r) => { resolve(r) })
                .catch((e) => { reject(e) })

        }
        catch (err) {
            reject(err)
        }
    })

}

module.exports = { verTodosAssociados, associarAluno, pesquisarUmAssociadoPeloId, removerAssociado, resgatarBrindeAssociado }