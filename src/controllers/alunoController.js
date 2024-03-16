const cursoModel = require("../models/cursoModel")
const alunoModel = require("../models/alunoModel")
const definirGraduacao = require("../utils/definirGraduacao")

async function cadastroAlunos(listaAluno) {

    // Pega o id da turma do aluno e coloca no fk_curso
    const alunosSeparadosPorTurmas = await separarAlunosNasTurmas(listaAluno)
    mandarAlunosDb(alunosSeparadosPorTurmas)




}

async function separarAlunosNasTurmas(listaAlunos) {
    const dataAtual = new Date();
    const anoAtual = new Date().getFullYear();
    const fechamentoPrimeiroSemestre = new Date(`${anoAtual}-06-01`);
    const listaAlunosNasTurmas = [];

    for (const aluno of listaAlunos) {
        let duracaoCurso = 2; // Padrão dos cursos técnicos 
        let semestreInicio = 1;

        aluno.Tipo = definirGraduacao(aluno);

        // Define o semestre de inicio
        if (dataAtual > fechamentoPrimeiroSemestre) {
            semestreInicio = 2;
        }

        const turma = await cursoModel.findAll({
            where: {
                nome: aluno.NomeCurso,
                modalidade: aluno.Tipo,
                semestre_inicio: semestreInicio,
                ano_inicio: anoAtual
            }
        });

        listaAlunosNasTurmas.push({
            CPF: aluno.Cpf,
            nome: aluno.Nome,
            email: aluno.Email,
            fk_curso: turma[0].dataValues.id_curso
        });
    }

    return listaAlunosNasTurmas
}


async function mandarAlunosDb(listaAlunos) {

    // Manda eles para o banco de dados comparando se ja não está cadastrado

    try {
        const promisesCriacaoAlunos = listaAlunos.map(async (aluno) => {
            try {
                await alunoModel.create(aluno);

                return { aluno, status: 'cadastrado' };
            } catch (error) {
                // Se ocorrer um erro durante a criação do aluno, retornamos o aluno com status 'erro'
                console.log(error)
                return { aluno, status: 'erro', erro: error.message };
            }
        });

        // Executa todas as Promises de criação em paralelo
        const resultados = await Promise.allSettled(promisesCriacaoAlunos);

        // Separa os alunos cadastrados dos alunos com erro
        const alunosCadastrados = [];
        const alunosComErro = [];

        resultados.forEach(resultado => {
            if (resultado.status === 'fulfilled' && resultado.value.status === 'cadastrado') {
                alunosCadastrados.push(resultado.value.aluno);
            } else if (resultado.status === 'rejected' || (resultado.status === 'fulfilled' && resultado.value.status === 'erro')) {
                alunosComErro.push(resultado.value.aluno);
            }
        });

        console.log('Alunos cadastrados:', alunosCadastrados);
        console.log('Alunos com erro:', alunosComErro);

    } catch (error) {
        console.error('Erro ao cadastrar alunos:', error);
    }

}

module.exports = cadastroAlunos