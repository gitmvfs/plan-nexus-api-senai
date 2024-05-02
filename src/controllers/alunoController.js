const cursoModel = require("../models/cursoModel")
const alunoModel = require("../models/alunoModel")
const { definirGraduacao, retirarFormatacao } = require("../utils/converterString")
const { tratarMensagensDeErro, novoErro } = require("../utils/errorMsg")

async function cadastroMultiplosAlunos(listaAluno, sequelize) {
    // Pega o id da turma do aluno e coloca no fk_curso
    const alunosSeparadosPorTurmas = await separarAlunosNasTurmas(listaAluno, sequelize)
    const resultado = await mandarAlunosDb(alunosSeparadosPorTurmas, sequelize)
    return resultado

}

async function separarAlunosNasTurmas(listaAlunos, sequelize) {
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

        const turma = await cursoModel(sequelize).findAll({
            where: {
                nome: aluno.NomeCurso,
                modalidade: aluno.Tipo,
                semestre_inicio: semestreInicio,
                ano_inicio: anoAtual
            }
        });

        const cpfSemFormatacao = retirarFormatacao(aluno.Cpf) // remove a formatação antes de mandar para o banco

        listaAlunosNasTurmas.push({
            CPF: cpfSemFormatacao,
            nome: aluno.Nome,
            email: aluno.Email,
            telefone: aluno.Telefone,
            celular: aluno.Celular,
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
                const alunoBanco = await alunoModel(sequelize).create(aluno);
                const alunoData = alunoBanco.dataValues
                const response = {
                    idAluno: alunoData.id_aluno,
                    nome: alunoData.nome,
                    email: alunoData.email,
                    telefone: aluno.telefone,
                    celular: aluno.celular,
                    id_curso: alunoData.fk_curso
                }
                return { aluno: response, status: 'cadastrado' };
            } catch (error) {
                // Se ocorrer um erro durante a criação do aluno, retornamos o aluno com status 'erro'
                const erroTratado = await tratarMensagensDeErro(error)
                return { aluno, status: 'erro', erro: erroTratado.message };
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
                resultado.value.aluno.msgErro = resultado.value.erro
                alunosComErro.push(resultado.value.aluno);
            }
        });

        return { alunosCadastrados: alunosCadastrados, alunosNaoCadastrados: alunosComErro }

    } catch (error) {
        return (error)
    }

}

function cadastroUnicoAluno(aluno, sequelize) {

    return new Promise(async (resolve, reject) => {
        try {
            const CPF = retirarFormatacao(aluno.CPF)

            await alunoModel(sequelize).create({
                CPF,
                nome: aluno.nome,
                email: aluno.email,
                fk_curso: aluno.fk_curso
            })
                .then((r) => {
                    aluno.idAluno = r.dataValues.id_aluno
                    resolve(aluno)
                })
                .catch((e) => {
                    reject(e)
                })
        }
        catch (e) {

            reject(e)
        }
    })


}

function atualizarAluno(aluno, sequelize) {

    return new Promise(async (resolve, reject) => {

        try {

        const { idAluno,CPF, nome, email, foto,fk_curso} = aluno


            sequelize.query("call editar_aluno(?,?,?,?,?,?)", {
                replacements: [idAluno, CPF, nome, email, foto, fk_curso],
                type: sequelize.QueryTypes.INSERT
            })
                .then((r) => !!r[0] == false ? novoErro(`Erro ao atualizar o aluno: ${r}` , 404) : resolve(r))
                .catch((e) => reject(e))
        }

        catch (err) {
            reject(err)
        }
    })
}

// Pode pesquisar por id, cpf ou email
function pesquisaAluno(idAluno, sequelize) {
    return new Promise(async (resolve, reject) => {

        try {
            await sequelize.query("select * from todos_alunos where id_aluno = ?;", {
                replacements: [idAluno],
                type: sequelize.QueryTypes.SELECT
            })
                .then((r) => !!r[0] == false ? novoErro("Aluno não encontrado", 404) : resolve(r))
                .catch((e) => reject(e))
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
            sequelize.query("select * from todos_alunos order by nome;")
                .then((r) => resolve(r[0]))
                .catch((e) => resolve(e))
        }
        catch (err) {
            reject(err)
        }
    })


}


module.exports = { cadastroMultiplosAlunos, cadastroUnicoAluno, atualizarAluno, pesquisaAluno, pesquisaTodosAlunos }