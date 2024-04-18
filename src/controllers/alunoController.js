const cursoModel = require("../models/cursoModel")
const alunoModel = require("../models/alunoModel")
const { definirGraduacao } = require("../utils/converterString")

async function cadastroMultiplosAlunos(listaAluno, sequelize) {

    // Pega o id da turma do aluno e coloca no fk_curso
    const alunosSeparadosPorTurmas = await separarAlunosNasTurmas(listaAluno)
    const resultado = await mandarAlunosDb(alunosSeparadosPorTurmas , sequelize)
    return resultado

}

async function separarAlunosNasTurmas(listaAlunos) {
    const dataAtual = new Date();
    const anoAtual = new Date().getFullYear();
    const fechamentoPrimeiroSemestre = new Date(`${anoAtual}-06-01`);
    const listaAlunosNasTurmas = [];

    for (const aluno of listaAlunos) {
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


async function mandarAlunosDb(listaAlunos, sequelize) {

    // Manda eles para o banco de dados comparando se ja não está cadastrado

    try {
        const promisesCriacaoAlunos = listaAlunos.map(async (aluno) => {
            try {
                await alunoModel(sequelize).create(aluno);

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

        return { alunosCadastrados: alunosCadastrados, alunosNaoCadastrados: alunosComErro }

    } catch (error) {
        return (error)
    }

}

function cadastroUnicoAluno(aluno,sequelize) {

    return new Promise(async (resolve, reject) => {
        try {
            await alunoModel(sequelize).create({
                CPF: aluno.CPF,
                nome: aluno.nome,
                email: aluno.email,
                fk_curso: aluno.fk_curso
            })
                .then((r) => resolve(r))
                .catch((e) => {
                    reject(e)
                })
        }
        catch (e) {
            
            reject(e)
        }
    })


}

function atualizarAluno(cpfAluno, emailAluno, dados, sequelize) {

    return new Promise(async (resolve, reject) => {

        try {
            let condicao = {}

            //Verifica se o dado do aluno está vazio, null e etc... Se estiver ele usa como condição o email para atualizar
            !!cpfAluno == false
                ? condicao = { email: emailAluno } :
                condicao = { CPF: cpfAluno }

            await alunoModel(sequelize).update(
                dados,
                {
                    where: condicao
                })
                .then((r) => resolve(r))
                .catch((e) => reject(e))
        }

        catch (err) {
            reject(err)
        }
    })
}

function pesquisaUnicoAluno(cpfAluno, emailAluno, sequelize) {
    return new Promise(async (resolve, reject) => {

        try {

            !!cpfAluno == false
                ? condicao = { email: emailAluno } :
                condicao = { CPF: cpfAluno }

            const aluno = await alunoModel(sequelize).findOne({
                where: condicao
            })
            aluno == null
                ? reject("Aluno não encontrado, verifique os dados.")
                : resolve(aluno.dataValues)
        }
        catch (err) {
            console.log(err)
            reject(err)
        }
    })
}

function pesquisaTodosAlunos(sequelize) {

    return new Promise(async (resolve, reject) => {

        try {
            //Verifica se o filtro está vazio e passa um json vazio caso contrario passa o proprio filtro
            sequelize.query("select * from todos_alunos order by nome;")
            .then((r) => resolve(r[0]))
            .catch((e) => resolve(e))
        }
        catch (err) {
            reject(err)
        }
    })


}


module.exports = { cadastroMultiplosAlunos, cadastroUnicoAluno, atualizarAluno, pesquisaUnicoAluno, pesquisaTodosAlunos }