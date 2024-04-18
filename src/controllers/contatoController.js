const { retirarFormatacao } = require("../utils/converterString")
const contatoModel = require("../models/contatoModel")
const { tratarMensagensDeErro } = require("../utils/errorMsg")
function cadastroMultiplosTelefones(listaAlunos, sequelize) {

    const listaAlunosCadastrados = listaAlunos.alunosCadastrados

    const listaContatos = criarListaContato(listaAlunosCadastrados)
    const respostaBanco = mandarContatoDB(listaContatos, sequelize)

    return respostaBanco
}

function criarListaContato(listaAlunosCadastrados) {

    const listaContato = []

    // Remove a formatação e cria a lista de contato que irá para o banco
    listaAlunosCadastrados.map((aluno) => {
        const { telefone, celular, ...restoInfo } = aluno
        const telefoneSemFormatacao = retirarFormatacao(telefone)
        const celularSemFormatacao = retirarFormatacao(celular)
        listaContato.push({ telefoneSemFormatacao, celularSemFormatacao, restoInfo })

    })

    return listaContato
}

function mandarContatoDB(listaContato, sequelize) {

    const erros = []
    try {

        listaContato.map(async (aluno) => {


            if (!!aluno.telefoneSemFormatacao == true) {
                console.log("chamou")
                await contatoModel(sequelize).create({ numero: aluno.telefoneSemFormatacao, tipo: "telefone fixo", fk_aluno: aluno.restoInfo.idAluno })
                    .catch((err) => erros.push({ aluno, err }))
            }
            if (!!aluno.celularSemFormatacao == true) {
                await contatoModel(sequelize).create({ numero: aluno.celularSemFormatacao, tipo: "telefone celular", fk_aluno: aluno.restoInfo.idAluno })
                    .catch((err) => erros.push({ aluno, err }))
            }
        })
    }
    catch (err) {
        const erroTratado = tratarMensagensDeErro(err)
        erros.push(erroTratado)
    }
    return erros
}



module.exports = { cadastroMultiplosTelefones }