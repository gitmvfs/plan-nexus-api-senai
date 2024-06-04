const cursoModel = require("../models/cursoModel")
const { definirGraduacao, retirarFormatacao } = require("../utils/converterString")
const { tratarMensagensDeErro, novoErro } = require("../utils/errorMsg")
const { associarAluno, pesquisarUmAssociadoPeloId, removerAssociado } = require("./associadoController")
const { resolve } = require("path")
const { salvarImagemAzure } = require('./blobController')
const { definirMultiplasSenhas } = require("./smtpController")
const Sequelize = require("sequelize")
const { compararHash } = require("../utils/bcrypt")
const { gerarToken } = require("../utils/jwt")

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
            definirMultiplasSenhas([{ nome: response.nome, email: response.email }])

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


async function loginAluno(aluno) {

    return new Promise(async (resolve, reject) => {
        try {
            const sequelize = new Sequelize({
                database: process.env.database_name,
                username: process.env.database_user_root, // dps atualizar para o login funcionario
                password: process.env.database_password_root, // dps atualizar para o senha funcionario
                host: process.env.database_host,
                dialect: 'mysql'
            });

            const { email, senha } = aluno;

            if (!email || !senha) {
                reject(novoErro("Email ou senha vazios.", 400))
                return
            }

            const usuario_criptografado = await retornarSenhaCriptografada(email, sequelize);

            if (usuario_criptografado.senha == undefined) {
                reject(novoErro("Primeira senha não cadastrada", 400))
                return
            }

            await confirmarSenhaCriptografa(senha, usuario_criptografado);

            const usuario = await pesquisaAluno(usuario_criptografado.id_aluno, sequelize);

            // Devolve os dados do usuário sem a senha
            const { senha: _, CPF: __, ...dadosUsuario } = usuario;


            // Gera o token para verificar se está logado
            const token = gerarToken(dadosUsuario[0].email, dadosUsuario[0].nome, "12h");

            await sequelize.query("call logar_aluno(? , ?)", {
                replacements: [dadosUsuario[0].id_aluno, token],
                type: sequelize.QueryTypes.UPDATE
            })
                .catch((err) => reject(err))

            // Adiciona o token à resposta
            dadosUsuario[0].token = token;

            resolve(dadosUsuario[0]);
        } catch (err) {
            // Se der algum erro inesperado no processo
            reject(err);
        }
    });
}


function retornarSenhaCriptografada(email, sequelize_login) {

    return new Promise(async (resolve, reject) => {
        const senhaCriptografada = await sequelize_login.query("select * from buscar_senhas_aluno where email = ?", {
            replacements: [email],
            type: sequelize_login.QueryTypes.SELECT
        })

        // Caso o usuario não exista
        !!senhaCriptografada[0] == false
            ? reject(novoErro("Usuario ou senha inválidos", 403))
            : ""

        resolve(senhaCriptografada[0])
    })
}

function confirmarSenhaCriptografa(senha, senhaCriptografada) {

    return new Promise(async (resolve, reject) => {
        const confirmarSenha = await compararHash(senha, senhaCriptografada.senha)

        if (!confirmarSenha) {
            reject(novoErro("Usuario ou senha inválidos", 403))
        }
        resolve()
    })

}

function atualizarFotoAluno(foto, aluno, sequelize) {
    return new Promise(async (resolve, reject) => {
        try {
            const idAluno = aluno.id_aluno
            let link = ""
            let mensagem = ""

            if (!!foto == false) {
                link = null
                mensagem = "Foto removida com sucesso"
            }
            else{
                link = await salvarImagemAzure('aluno',foto)
                link = JSON.stringify(link)
                mensagem = "Foto adicionada com sucesso"
            }

            const linkContrato = await salvarImagemAzure('contrato', contrato)


            await sequelize.query("call atualizar_foto_aluno(?,?,?)", {
                replacements: [idAluno , link, idAluno],
                type: sequelize.QueryTypes.INSERT
            })
                .then((r) => resolve(r))
                .catch((e) => reject(e))

        } catch (error) {
            reject(error)
        }
    })

}

module.exports = { cadastroMultiplosAlunos, cadastroUnicoAluno, atualizarAluno, pesquisaAluno, pesquisaTodosAlunos, pesquisarAlunoPorCpf, loginAluno, atualizarFotoAluno }