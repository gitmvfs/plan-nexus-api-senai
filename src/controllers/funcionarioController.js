const { Sequelize, DATE } = require('sequelize')
const funcionarioModel = require('../models/funcionarioModel')
const { compararHash } = require("../utils/bcrypt")
const { gerarToken } = require("../utils/jwt")
const { resolve } = require("path")
const { novoErro } = require('../utils/errorMsg')
const { Blob } = require('buffer')
const { salvarImagemAzure } = require('./blobController')
const dotenv = require("dotenv").config({ path: resolve(__dirname, "../", "../", ".env") })
const { definirMultiplasSenhas } = require("../controllers/smtpController")

function cadastrarFuncionario(funcionario, sequelize) {
    return new Promise(async (resolve, reject) => {
        try {
            const { NIF, nome, email, nivel_acesso } = funcionario

            await sequelize.query("call cadastrar_funcionario(?,?,?,?)", {
                replacements: [NIF, nome, email, nivel_acesso],
                type: sequelize.QueryTypes.INSERT
            })
                .then((r) => { definirMultiplasSenhas([{ nome: nome, email: email }]); resolve(r) })
                .catch((e) => reject(e))
        } catch (err) {
            reject(err)
        }
    })
}

function pesquisarUnicoFuncionario(NIF, sequelize) {
    return new Promise(async (resolve, reject) => {
        try {
            await sequelize.query("select * from todos_funcionarios where NIF = ? ;", {
                replacements: [NIF],
                type: sequelize.QueryTypes.SELECT
            })
                .then((r) => resolve(r))
                .catch((e) => reject(e))

        } catch (error) {
            reject(error)
        }
    })
}


function pesquisarUnicoFuncionarioId(id, sequelize) {
    return new Promise(async (resolve, reject) => {
        try {
            await sequelize.query("select * from todos_funcionarios where id_funcionario = ? ;", {
                replacements: [id],
                type: sequelize.QueryTypes.SELECT
            })
                .then((r) => resolve(r))
                .catch((e) => reject(e))

        } catch (error) {
            reject(error)
        }
    })
}



async function editarFuncionario(dadosFuncionario, foto, sequelize) {

    return new Promise(async (resolve, reject) => {
        try {
            const { idFuncionario, NIF, nome, email, nivel_acesso } = dadosFuncionario

            // Verifica se o usuario existe no banco
            const funcionarioExistente = await pesquisarUnicoFuncionarioId(idFuncionario, sequelize)

            if (!!funcionarioExistente[0] == false) {
                reject(novoErro("Funcionario não encontrado", 404))
            }

            let linkImagem = ""
            if (!!foto == true) {
                linkImagem = await salvarImagemAzure("funcionario", foto)
            }
            else {
                linkImagem = funcionarioExistente[0].foto
            }


            await sequelize.query("call editar_funcionario(?,?,?,?,?,?)", {
                replacements: [idFuncionario, NIF, nome, email, linkImagem, nivel_acesso],
                type: sequelize.QueryTypes.UPDATE
            })
                .then((r) => resolve(r))
                .catch((e) => reject(e))

            resolve("Funcionário atualizado com sucesso.");
        } catch (err) {
            reject(err);
        }
    });
}

async function loginFuncionario(funcionario) {

    return new Promise(async (resolve, reject) => {
        try {
            const sequelize = new Sequelize({
                database: process.env.database_name,
                username: process.env.database_user_root, // dps atualizar para o login funcionario
                password: process.env.database_password_root, // dps atualizar para o senha funcionario
                host: process.env.database_host,
                dialect: 'mysql'
            });

            const { email, senha } = funcionario;

            if(!email || !senha){
                reject(novoErro("Email ou senha vazios.", 400))
                return
            }

            const usuario_criptografado = await retornarSenhaCriptografada(email, sequelize);
            await confirmarSenhaCriptografa(senha, usuario_criptografado);
            const usuario = await pesquisarUnicoFuncionario(usuario_criptografado.NIF, sequelize);

            // Devolve os dados do usuário sem a senha
            const { senha: _, CPF: __, ...dadosUsuario } = usuario;

            // Gera o token para verificar se está logado
            const token = gerarToken(dadosUsuario[0].email, dadosUsuario[0].nome, "12h");

            await sequelize.query("call logar_funcionario(? , ?)", {
                replacements: [dadosUsuario[0].NIF, token],
                type: sequelize.QueryTypes.UPDATE
            });

            // Adiciona o token à resposta
            dadosUsuario[0].token = token;

            resolve(dadosUsuario[0]);
        } catch (err) {
            // Se der algum erro inesperado no processo
            console.log("erro")
            reject(err);
        }
    });
}

function pesquisarTodosFuncionarios(sequelize) {

    return new Promise(async (resolve, reject) => {
        try {

            await sequelize.query("select * from todos_funcionarios order by nome;")
                .then((r) => resolve(r[0]))
                .catch((e) => reject(e))

        } catch (error) {
            reject(error)
        }
    })
}


function deslogarFuncionario(nif, token, sequelize, req) {

    return new Promise(async (resolve, reject) => {

        // Pesquisa se o funcionario existe

        const response = await pesquisarUnicoFuncionario(nif, sequelize)
        !!response == false ? reject(novoErro("Funcionario não entrado", 404)) : ""

        // Valida o token do usuario para deslogar

        await sequelize.query("call deslogar_funcionario(?,?)", {
            replacements: [response[0].id_funcionario, token],
            type: sequelize.QueryTypes.UPDATE

        })
            .then((r) => resolve(r))
            .catch((e) => reject(e))
    })
}




function retornarSenhaCriptografada(email, sequelize_login) {

    return new Promise(async (resolve, reject) => {
        const senhaCriptografada = await sequelize_login.query("select * from buscar_senhas_funcionario where email = ?", {
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

function inativarFuncionario(NIF, sequelize) {
    return new Promise(async (resolve, reject) => {

        try {
            await sequelize.query("call inativar_funcionario(?)",
                {
                    replacements: [NIF],
                    type: sequelize.QueryTypes.UPDATE
                })
                .then((r) => { resolve(r) })
                .catch((e) => { reject(e) })

        } catch (error) {
            reject(error)
        }
    })
}

module.exports = { cadastrarFuncionario, pesquisarTodosFuncionarios, pesquisarUnicoFuncionario, editarFuncionario, loginFuncionario, deslogarFuncionario, inativarFuncionario };
