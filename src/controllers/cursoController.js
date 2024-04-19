const cursoModel = require("../models/cursoModel")
const {definirGraduacao} = require("../utils/converterString")


async function cadastroDeTurmas(listaAlunos,sequelize) {

    return new Promise(async (resolve, reject) => {

        try {
            const listaTurmas = extrairTurmasDosAlunos(listaAlunos)
            const turmasUnicas = retirarTurmasRepetidas(listaTurmas)
            const turmasDefinidas = calcularDuracaoSemestresCursos(turmasUnicas) // nesta estapa os dados das turmas já estão prontos para inserir no banco
            await enviarTurmasParaDB(turmasDefinidas,sequelize)
            resolve(200)
        }
        catch (err) {
            reject(err)
        }

    })

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

async function enviarTurmasParaDB(turmasDefinidas,sequelize) {
    // Mapeia as promessas de inserção de turmas
    const insercoesTurmas = turmasDefinidas.map(async (turma) => {
        const listaTurmasCadastradas = await cursoModel(sequelize).findOne({
            where: {
                nome: turma.nome,
                modalidade: turma.modalidade,
                semestre_inicio: turma.semestre_inicio,
                ano_inicio: turma.ano_inicio,
                curso_duracao: turma.curso_duracao
            }
        });
        // Se não houver registro, cadastra a turma no banco
        if (!!listaTurmasCadastradas == false) {
            return cursoModel(sequelize).create(turma);
        } else {
            return null; // Retorna null para indicar que a turma já está cadastrada
        }
    });

    // Aguarda a conclusão de todas as inserções
    const resultadosInsercao = await Promise.all(insercoesTurmas);

    // Filtra os resultados para remover entradas nulas
    const turmasInseridas = resultadosInsercao.filter(resultado => resultado !== null);

    // Retorna as turmas inseridas
    return turmasInseridas;
}

module.exports = { cadastroDeTurmas }