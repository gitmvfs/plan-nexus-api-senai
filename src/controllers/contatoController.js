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

async function cadastroUnicoTelefone(aluno, sequelize) {

    const erros = [] // Caso tenha dado algum erro devolve a lista com os erros
    try {

        // Remove as formatações do número 
        const telefone = retirarFormatacao(aluno.telefone)
        const celular = retirarFormatacao(aluno.celular)

        //  caso o número exista inseri na tabela
        if (!!telefone == true) {
            await contatoModel(sequelize).create({ numero: telefone, tipo: "telefone fixo", fk_aluno: aluno.idAluno })
                .catch((err) => erros.push({ aluno, err }))
        }

        if (!!celular == true) {
            await contatoModel(sequelize).create({ numero: celular, tipo: "telefone celular", fk_aluno: aluno.idAluno })
                .catch((err) => erros.push({ aluno, err }))
        }

        //Seria bom validar e devolver um "erro" caso o aluno não tenha telefone e celular
    }
    catch (err) {
        const erroTratado = tratarMensagensDeErro(err)
        erros.push(erroTratado)
    }
    return erros

}

module.exports = { cadastroMultiplosTelefones, cadastroUnicoTelefone }