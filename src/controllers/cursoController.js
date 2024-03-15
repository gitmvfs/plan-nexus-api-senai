const cursoModel = require("../models/cursoModel")

function cadastroDeTurmas(listaAlunos) {

    const listaTurmas = extrairTurmasDosAlunos(listaAlunos)
    const turmarUnicas = retirarTurmasRepetidas(listaTurmas)
    colocarNivelGraduacao(turmarUnicas)
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

        // Verifica se existe a turma , caso a turma for unica e não existir adiciona na lista de turmas unicas
        setTurmasUnicas.has(turma.nomeCurso + turma.Tipo + turma.CodigoTurma)
            ? ""
            : arrayTurmasUnicas.push({ nomeCurso: turma.nomeCurso, Tipo: turma.Tipo, CodigoTurma: turma.CodigoTurma })

        setTurmasUnicas.add(turma.nomeCurso + turma.Tipo + turma.CodigoTurma)
    })

    return arrayTurmasUnicas;
}

function colocarNivelGraduacao(listaTurmasUnicas) {

    const listaTurmasComGraduacao = []

    const listaCursosTecnicos = ["técnico", "técnica", "tecnico", "tecnica"] // palavras-chaves para cursos técnicos
    const listaCursosSuperiores = ["técnologico", "técnologo", "bacharelado", "graduação", "extensão"] // palavras-chaves para cursos superiores

    listaTurmasUnicas.map((turma) => {

        let cursoTecnico = false
        let cursoSuperior = false
        let turmaEstado = false

        //Verifica se a turma é técnico
        for (const palavraChave of listaCursosTecnicos) {
            if (turma.Tipo.toLowerCase().includes(palavraChave)) {

                cursoTecnico = true;

                //Se for técnico verifica se é do estado 
                if (turma.CodigoTurma.toLowerCase().includes("seduc")) {

                    turmaEstado = true
                }
                break; // Se encontrou, pode parar a iteração
            }
        }

        //Se não for técnico vai verificar se é superior
        if (!cursoTecnico) {
            for (const palavraChave of listaCursosSuperiores) {
                if (turma.Tipo.toLowerCase().includes(palavraChave)) {
                    cursoSuperior = true;
                    break; // Se encontrou, pode parar a iteração
                }
            }

        }

        // Define a data de acordo com o tipo da graduação

        // Se a turma é técnico do estado
        if (cursoTecnico && turmaEstado) {
            console.log(" É ESTADO: " + turma.Tipo)
        }
        // Se a turma é curso técnico
        if (cursoTecnico) {
            console.log(" É tecnico: " + turma.Tipo)

        }
        // Se a turma é superior
        if (cursoSuperior) {
            console.log(" É superior: " + turma.Tipo)

        }
        if (!cursoTecnico && !cursoSuperior) {
            console.log(" É outros: " + turma.Tipo)

        }


    }
    )
}
// console.log(listaTurmasParaCadastro)

module.exports = { cadastroDeTurmas }