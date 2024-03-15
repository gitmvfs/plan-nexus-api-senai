const cursoModel = require("../models/cursoModel")

function cadastroDeTurmas(listaAlunos) {

    const listaTurmas = extrairTurmasDosAlunos(listaAlunos)
    const turmarUnicas = retirarTurmasRepetidas(listaTurmas)
    const turmasDefinidas = calcularDuracaoSemestresCursos(turmarUnicas) // nesta estapa os dados das turmas já estão prontos para inserir no banco
    enviarParaOBanco(turmasDefinidas)

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

        // const listaCursosTecnicos = ["técnico", "técnica", "tecnico", "tecnica"] // palavras-chaves para cursos técnicos
        const listaCursosSuperiores = ["técnologico", "técnologo", "bacharelado", "graduação", "extensão"] // palavras-chaves para cursos superiores

        //Compara se a lista é de curso superior
        for (const palavraChave of listaCursosSuperiores) {

            if (turma.Tipo.toLowerCase().includes(palavraChave)) {
                turma.Tipo = "superior";
                break; // Se encontrou, pode parar a iteração
            }
        }

        //Se não for superior é tecnico
        if (!turma.Tipo.includes("superior")) {
            turma.Tipo = "tecnico"
        }

        //Se precisar criar outras categorias é só criar uma condição que compara que não é nem superior e nem técnico

        // Verifica se existe a turma , caso a turma for unica e não existir adiciona na lista de turmas unicas
        setTurmasUnicas.has(turma.nomeCurso + turma.Tipo)
            ? ""
            : arrayTurmasUnicas.push({ nomeCurso: turma.nomeCurso, Tipo: turma.Tipo })

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

        listaTurmasDefinidas.push({
            nome: turma.nomeCurso.toLowerCase(),
            modalidade: turma.Tipo.toLowerCase(),
            semestre_inicio: semestreInicio,
            ano_inicio: anoAtual,
            curso_duracao: duracaoCurso
        })

    })

    return listaTurmasDefinidas

}

function enviarParaOBanco(turmasDefinidas) {

    turmasDefinidas.map((turma) => {
        cursoModel.create({
            nome: turma.nome,
            modalidade: turma.modalidade,
            semestre_inicio: turma.semestre_inicio,
            ano_inicio: turma.ano_inicio,
            curso_duracao: turma.curso_duracao
        })
    })


}


module.exports = { cadastroDeTurmas }