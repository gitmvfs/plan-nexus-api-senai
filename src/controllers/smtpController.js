const nodemailer = require("nodemailer");
const { resolve } = require("path")
const dotenv = require("dotenv").config({ path: resolve(__dirname, "../", "../", ".env") })
const { Sequelize } = require("sequelize");
// const { pesquisaTodosAlunos } = require("./alunoController");
// const { pesquisarTodosFuncionarios } = require("./funcionarioController");
const { gerarToken } = require("../utils/jwt");
const { novoErro } = require("../utils/errorMsg");
const { gerarHash } = require("../utils/bcrypt");

// Configura a rota do emaill

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.USER_AUTH_SMTP,
        pass: process.env.PASS_AUTH_SMTP,
    },
});

// Função para enviar email
async function enviarEmail(emailPara, emailCopia, titulo, corpoHtml) {
    console.log(new Date().toLocaleTimeString())

    const info = await transporter.sendMail({
        from: process.env.USER_AUTH_SMTP,
        to: emailPara,
        cc: emailCopia,
        subject: titulo,
        html: corpoHtml // Conteudo do email,
    })

    return info

}

// ENvia o email com o link redirecionando para o front com  o token
function enviarEmailRedefinirSenha(email) {

    return new Promise(async (resolve, reject) => {

        try {
            const emailRedefinicao = email

            // Cria conexão com o banco
            const sequelize = new Sequelize({
                database: process.env.database_name,
                username: process.env.database_user_root, // dps atualizar para o login funcionario
                password: process.env.database_password_root, // dps atualizar para o senha funcionario
                host: process.env.database_host,
                dialect: 'mysql'
            });

            // devolve os dados do usuario e qual tabela ele pertence
            const { usuario, tabelaUsuario } = await procurarUsuarioPeloEmail(emailRedefinicao, sequelize)

            const token = gerarToken(emailRedefinicao, usuario.nome, "15m")

            await atualizarTokenUsuario(usuario[0], tabelaUsuario, token, sequelize)

            await enviarEmail(email, "", "Definição de Senha AAPM", `<h1>Clique para atualizar sua senha: <a href="http://https://plan-nexus-gestao.agreeableisland-158f361b.brazilsouth.azurecontainerapps.io/recuperar-senha/${token}" >Aqui</a> </h1> `)
                .then((r) => {
                    if (!!r.accepted[0] == true) {
                        resolve(r.accepted[0])
                    }
                    else {
                        reject(novoErro("Email não encontrado ou inválido.", 400))
                    }
                })
        } catch (error) {
            reject(error)
        }
    })

}

function procurarUsuarioPeloEmail(email, sequelize) {

    return new Promise(async (resolve, rejetc) => {
        try {

            let tabelaUsuario = "Aluno"
            if (!email) {
                rejetc(novoErro("Email vazio", 400))
            }

            const resultadoEmaiAluno = await sequelize.query("select * from todos_alunos where email = ?", {
                replacements: [email],
                type: sequelize.QueryTypes.SELECT
            })

            let resultadoEmailFuncionario = ""

            if (!!resultadoEmaiAluno[0] == false) {
                resultadoEmailFuncionario = await sequelize.query("select * from todos_funcionarios where email = ?", {
                    replacements: [email],
                    type: sequelize.QueryTypes.SELECT
                })

                tabelaUsuario = "Funcionario"
            }

            if (!!resultadoEmaiAluno[0] == false && !!resultadoEmailFuncionario[0] == false) {
                rejetc(novoErro("Email não encontrado", 400))
            }

            !!resultadoEmaiAluno[0] == true ? resolve({ usuario: resultadoEmaiAluno, tabelaUsuario }) : resolve({ usuario: resultadoEmailFuncionario, tabelaUsuario })

        }
        catch (err) {
            rejetc(err)
        }
    })
}

function validarTokenRecuperarSenha(tabela, token, sequelize) {

    return new Promise(async (resolve, reject) => {

        try {

            if (tabela == "Aluno") {
                const user = await sequelize.query("select * from buscar_token_recuperar_senha_aluno where token_recuperar_senha = ?  ", {
                    replacements: [token],
                    type: sequelize.QueryTypes.SELECT
                })
                    .catch((e) => reject(e))
                console.log(user)

                if (!!user[0] == false) {
                    reject(novoErro("Token inválido - ERR 2332", 400))
                }

            }
            else if (tabela == "Funcionario") {
                const user = await sequelize.query("select * from buscar_token_recuperar_senha_funcionario where token_recuperar_senha = ?", {
                    replacements: [token],
                    type: sequelize.QueryTypes.SELECT
                })
                    .catch((e) => reject(e))

                if (!!user[0] == false) {
                    reject(novoErro("Token inválido - ERR 2332", 400))
                }


            }

            resolve()
        }
        catch (err) {
            reject(err)
        }
    })

}

function atualizarTokenUsuario(usuario, tabela, token, sequelize) {

    return new Promise(async (resolve, rejetc) => {

        try {

            if (tabela == "Aluno") {

                await sequelize.query("call definir_token_recuperar_senha_aluno  (?,?)", {
                    replacements: [usuario.id_aluno, token],
                    type: sequelize.QueryTypes.UPDATE
                })
                    .catch((err) => rejetc(err))

            }
            else {
                await sequelize.query("call definir_token_recuperar_senha_funcionario (?,?)", {
                    replacements: [usuario.id_funcionario, token],
                    type: sequelize.QueryTypes.UPDATE
                })
                    .catch((err) => rejetc(err))
            }
        }
        catch (err) {
            rejetc(err)
        }

        resolve("Token recuperar senha gerado com sucesso")

    })
}

function definirMultiplasSenhas(listaEmail) {

    return new Promise(async (resolve, reject) => {
        try {

            const listaEmailEnviado = []
            const listaEmailErro = []

            const listaPromise = listaEmail.map((aluno) => enviarEmailRedefinirSenha(aluno.email))

            await Promise.all(listaPromise)
                .then((r) => {
                    console.log("Resposta: ", r)
                    listaEmailEnviado.push(r)
                })
                .catch((e) => {
                    listaEmailErro.push(e)
                })
            const response = { listaEmailEnviado, listaEmailErro }

            // FATORAR DEPOIS

            let htmlResponse = "E-mails enviado com sucesso:  \n"
            !!listaEmailEnviado[0] == true ? listaEmailEnviado[0].map((email) => htmlResponse += `<h3>${email} \n</h3> `) : ""
            htmlResponse += "E-mails malsucedidos: \n"
            !!listaEmailErro[0] == true ? listaEmailErro[0].map((email) => htmlResponse += `<h3>${email} \n</h3> `) : ""

            // Envia um e-mail para confirmar q enviou tudo como deveria.
            enviarEmail("spectra.inc22@gmail.com", "mvfs8001@gmail.com", `Relatório de e-mail - ${Date()} `, htmlResponse)
            resolve(response)
        }
        catch (err) {
            reject(err)
        }
    })

}


function redefinirSenha(email, senha, token) {

    return new Promise(async (resolve, reject) => {
        try {

            const sequelize = new Sequelize({
                database: process.env.database_name,
                username: process.env.database_user_root, // dps atualizar para o login funcionario
                password: process.env.database_password_root, // dps atualizar para o senha funcionario
                host: process.env.database_host,
                dialect: 'mysql'
            });

            // busca o usuario no banco
            const { usuario, tabelaUsuario } = await procurarUsuarioPeloEmail(email, sequelize)
            await validarTokenRecuperarSenha(tabelaUsuario, token, sequelize)

            // gera a novaSenha
            const novaSenha = await gerarHash(senha)

            // define a senha de acordo com o tipo
            if (tabelaUsuario == 'Aluno') {
                await sequelize.query('call definir_senha_aluno(?,?)', {
                    replacements: [usuario[0].id_aluno, novaSenha],
                    type: sequelize.QueryTypes.UPDATE,
                })
                    .catch((e) => reject(e))

                await sequelize.query('call definir_token_recuperar_senha_aluno(?,?)', {
                    replacements: [usuario[0].id_aluno, null],
                    type: sequelize.QueryTypes.UPDATE,
                })
                    .catch((e) => reject(e))
            }
            else if (tabelaUsuario == 'Funcionario') {
                await sequelize.query('call definir_senha_funcionario(?,?)', {
                    replacements: [usuario[0].id_funcionario, novaSenha],
                    type: sequelize.QueryTypes.UPDATE,
                })
                    .catch((e) => reject(e))

                await sequelize.query('call definir_token_recuperar_senha_funcionario(?,?)', {
                    replacements: [usuario[0].id_funcionario, null],
                    type: sequelize.QueryTypes.UPDATE,
                })
                    .catch((e) => reject(e))
            }

            resolve()
        }
        catch (err) {
            reject(err)
        }
    })
}

module.exports = { definirMultiplasSenhas, enviarEmailRedefinirSenha, redefinirSenha, }
