const cursoModel = require("../models/cursoModel")
const conectar_db = require("../services/conectarDB")
const Sequelize = require("sequelize")
const definirGraduacao = require("../utils/definirGraduacao")


async function cadastroDeTurmas(listaAlunos) {

    const listaTurmas = extrairTurmasDosAlunos(listaAlunos)
    const turmasUnicas = retirarTurmasRepetidas(listaTurmas)
    const turmasDefinidas = calcularDuracaoSemestresCursos(turmasUnicas) // nesta estapa os dados das turmas já estão prontos para inserir no banco
    await enviarTurmasParaDB(turmasDefinidas)
}

function extrairTurmasDosAlunos(listaAlunos) {
    const listaTurmas = [] // pega os alunos e cria turmas baseadas no código + tipo + nomeCurso

    for (let index = 0; index < listaAlunos.length; index++) {

        const aluno = listaAlunos[index] // pega apenas os atributos dos alunos sem as chaves

        const obj = {};

        // Pega o aluno e extrai as informações da turma dele OBS: CASO MUDE O NOME DA TABELAS A MANUTENÇÃO É AQUI

        obj[["nomeCurso"]] = aluno.NomeCurso
        obj[["Tipo"]] = aluno.Tipo
        obj[["CodigoTurma"]] = aluno.CodigoTurma

        listaTurmas.push(obj) // adiciona as turmas com nome do curso + tipo + codigo da turma a lista
    }
    return listaTurmas
}

function retirarTurmasRepetidas(listaTurmasRepetidas) {

    const setTurmasUnicas = new Set() // um tipo de dado que não pode ter mais de uma ocorrencia igual, vou usar p verificar se a turma unica ja foi adicionada ou não
    const arrayTurmasUnicas = []

    listaTurmasRepetidas.map((turma) => {

        turma.Tipo = definirGraduacao(turma)

        //Se precisar criar outras categorias é só criar uma condição que compara que não é nem superior e nem técnico

        // Verifica se existe a turma , caso a turma for unica e não existir adiciona na lista de turmas unicas
        setTurmasUnicas.has(turma.nomeCurso + turma.Tipo)
            ? ""
            : arrayTurmasUnicas.push({ nomeCurso: turma.nomeCurso, Tipo: turma.Tipo, codigoTurma: turma.CodigoTurma })

        setTurmasUnicas.add(turma.nomeCurso + turma.Tipo)
    })

    return arrayTurmasUnicas;
}

function calcularDuracaoSemestresCursos(listaTurmasUnicas) {

    const dataAtual = new Date()
    const anoAtual = new Date().getFullYear()
    const fechamentoPrimeiroSemestre = new Date(`${anoAtual}-06-01`)

    const listaTurmasDefinidas = []

    listaTurmasUnicas.map((turma) => {
        let duracaoCurso = 2 // Padrão dos cursos técnicos 
        let semestreInicio = 1

        // Define a duração do curso para nivel superior
        if (turma.Tipo.includes("superior")) {
            duracaoCurso = 3
        }

        // Define o semestre de inicio
        if (dataAtual > fechamentoPrimeiroSemestre) {
            semestreInicio = 2
        }
        // console.log(turma)

        listaTurmasDefinidas.push({
            // CodigoTurma: turma.codigoTurma,
            nome: turma.nomeCurso.toLowerCase(),
            modalidade: turma.Tipo.toLowerCase(),
            semestre_inicio: semestreInicio,
            ano_inicio: anoAtual,
            curso_duracao: duracaoCurso
        })

    })

    return listaTurmasDefinidas

}

async function enviarTurmasParaDB(turmasDefinidas) {

    // Vai tentar inserir cada turma individualmente para ver se ja está cadastrada ou não
    turmasDefinidas.map((turma) => {

        //Realiza uma pesquisa no modelo do curso para inserir as turmas
        const listaTurmasCadastradas = []

        cursoModel.findAll({
            where: {
                nome: turma.nome,
                modalidade: turma.modalidade,
                semestre_inicio: turma.semestre_inicio,
                ano_inicio: turma.ano_inicio,
                curso_duracao: turma.curso_duracao
            }
        })
            .then((r) => {

                // Caso não exista registro, cadastra no banco
                if (r.length == 0) {
                    cursoModel.create(turma)
                        .then((r) => {
                            console.log("Turma cadastrada: " + r)
                        })
                }
            })
    })


}

module.exports = { cadastroDeTurmas }