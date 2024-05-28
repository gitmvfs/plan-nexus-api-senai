const cursoModel = require("../models/cursoModel")
const alunoModel = require("../models/alunoModel")
const { definirGraduacao, retirarFormatacao } = require("../utils/converterString")
const { tratarMensagensDeErro, novoErro } = require("../utils/errorMsg")
const { associarAluno, pesquisarUmAssociadoPeloId, removerAssociado } = require("./associadoController")
const { resolve } = require("path")
const { salvarImagemAzure } = require('./blobController')
const { definirMultiplasSenhas } = require("./smtpController")

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

        listaAlunosNasTurmas.push({
            CPF: retirarFormatacao(aluno.Cpf),
            nome: aluno.Nome,
            email: aluno.Email,
            telefone: retirarFormatacao(aluno.Telefone),
            celular: retirarFormatacao(aluno.Celular),
            fk_curso: turma[0].dataValues.id_curso
        });
    }

    return listaAlunosNasTurmas
}

async function pesquisarAlunoPorCpf(CPF, sequelize) {

    return new Promise(async (resolve, reject) => {

        try {
            await sequelize.query("select * from todos_alunos where CPF = ?;", {
                replacements: [CPF],
                type: sequelize.QueryTypes.SELECT
            })
                .then((r) => !!r[0] == false ? reject(novoErro("Aluno não encontrado", 404)) : resolve(r))
                .catch((e) => reject(e))
        }
        catch (err) {
            reject(err)
        }
    })
}


async function mandarAlunosDb(listaAlunos, sequelize) {

    // Manda eles para o banco de dados comparando se ja não está cadastrado

    try {
        const promisesCriacaoAlunos = listaAlunos.map(async (aluno) => {
            try {
                // inserindo o aluno no database

                const { CPF, nome, email, telefone, celular, fk_curso } = aluno

                await sequelize.query("call cadastrar_aluno(?,?,?,?,?,?)", {
                    replacements: [CPF, nome, email, fk_curso, celular, telefone],
                    type: sequelize.QueryTypes.INSERT
                })

                const dadosAluno = await pesquisarAlunoPorCpf(CPF, sequelize)

                const response = {
                    id_aluno: dadosAluno[0].id_aluno,
                    CPF,
                    nome,
                    email,
                    telefone,
                    celular,
                    curso: dadosAluno.curso,
                    modalidade: dadosAluno.modalidade
                }

                return { aluno: response, status: 'cadastrado' };
            } catch (error) {
                // Se ocorrer um erro durante a criação do aluno, retornamos o aluno com status 'erro'
                const erroTratado = await tratarMensagensDeErro(error)
                return { aluno, status: 'erro', erro: erroTratado.message };
            }
        });

        // Executa todas as Promises de criação em paralelo
        const resultados = await Promise.all(promisesCriacaoAlunos);

        // Separa os alunos cadastrados dos alunos com erro
        const alunosCadastrados = [];
        const alunosComErro = [];
        const envioEmail = []

        resultados.map((resultadoCadastro) => {
            if (resultadoCadastro.status == "erro") {
                alunosComErro.push(resultadoCadastro)
            }
            else {
                alunosCadastrados.push(resultadoCadastro)
                envioEmail.push({
                    nome: resultadoCadastro.aluno.nome,
                    email: resultadoCadastro.aluno.email
                })
            }
        })

        definirMultiplasSenhas(envioEmail)

        return { alunosCadastrados: alunosCadastrados, alunosNaoCadastrados: alunosComErro }

    } catch (error) {
        return (error)
    }

}

function cadastroUnicoAluno(aluno, sequelize) {

    return new Promise(async (resolve, reject) => {
        try {
            // inserindo o aluno no database

            const { CPF, nome, email, telefone, celular, fk_curso, socioAapm } = aluno

            await sequelize.query("call cadastrar_aluno(?,?,?,?,?,?)", {
                replacements: [CPF, nome, email, fk_curso, celular, telefone],
                type: sequelize.QueryTypes.INSERT
            })

            const dadosAluno = await pesquisarAlunoPorCpf(CPF, sequelize)

            let response = {
                id_aluno: dadosAluno[0].id_aluno,
                CPF,
                nome,
                email,
                telefone,
                celular,
                curso: dadosAluno.curso,
                modalidade: dadosAluno.modalidade
            }

            if (socioAapm) {
                const dadosSocio = {
                    id_aluno: dadosAluno[0].id_aluno,
                    brinde: false,
                    dataAssociacao: new Date()

                }
                await associarAluno(dadosSocio, sequelize)
                response["dadosAssociado"] = await pesquisarUmAssociadoPeloId(dadosAluno[0].id_aluno, sequelize)
            }
            definirMultiplasSenhas([{nome: response.nome, email: response.email}])

            resolve(response)
        } catch (error) {

            reject(error)
        }
    })


}

function atualizarAluno(aluno, foto, sequelizeParams) {

    return new Promise(async (resolve, reject) => {

        try {
            const sequelize = sequelizeParams
            const { idAluno, CPF, nome, email, fk_curso, socioAapm, telefone, celular } = aluno

            // pesquisa se o aluno existe antes de atualizar
            const alunoExiste = await pesquisaAluno(idAluno, sequelize)

            if (!!alunoExiste[0] == false) {
                reject(novoErro("Aluno não encontrado", 404))
            }

            // troca a foto caso o arquivo
            let linkImagem = ""
            if (!!foto == true) {
                linkImagem = await salvarImagemAzure("aluno", foto)
            }
            else {
                linkImagem = alunoExiste[0].foto
            }
            // realiza a operação de editar o aluno
            await sequelize.query("call editar_aluno(?,?,?,?,?,?,?,?)", {
                replacements: [idAluno, CPF, nome, email, foto, fk_curso, celular, telefone],
                type: sequelize.QueryTypes.UPDATE
            })

            // confirma que o aluno foi atualizado e guarda na resposta
            const response = await pesquisaAluno(idAluno, sequelize)

            // caso o aluno seja sócio da aapm atribui ele aos associados
            if (socioAapm == "true") {
                const dadosSocio = {
                    id_aluno: idAluno,
                    brinde: false,
                    dataAssociacao: new Date()

                }
                //await associarAluno(dadosSocio, sequelize)
                response["dadosAssociado"] = await pesquisarUmAssociadoPeloId(idAluno, sequelize)


            } else {
                // caso ele não seja sócio/ remove ele caso ele esteja na tabela ou apenas n faz nada.

                await sequelize.query("call encerrar_associacao(?)", {
                    replacements: [idAluno],
                    type: sequelize.QueryTypes.DELETE
                })

            }

            resolve(response)
        }

        catch (err) {
            reject(err)
        }
    })
}

function pesquisaAluno(idAluno, sequelize) {
    return new Promise(async (resolve, reject) => {

        try {
            await sequelize.query("select * from todos_alunos where id_aluno = ?;", {
                replacements: [idAluno],
                type: sequelize.QueryTypes.SELECT
            })
                .then((r) => !!r[0] == false ? reject(novoErro("Aluno não encontrado", 404)) : resolve(r))
                .catch((e) => reject(e))
        }
        catch (err) {
            reject(err)
        }
    })
}


function pesquisaTodosAlunos(sequelize) {

    return new Promise(async (resolve, reject) => {

        try {
            await sequelize.query("select * from todos_alunos order by nome;")
                .then((r) => resolve(r[0]))
                .catch((e) => resolve(e))
        }
        catch (err) {
            reject(err)
        }
    })


}

module.exports = { cadastroMultiplosAlunos, cadastroUnicoAluno, atualizarAluno, pesquisaAluno, pesquisaTodosAlunos }