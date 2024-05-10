const { Sequelize, DATE } = require('sequelize')
const funcionarioModel = require('../models/funcionarioModel')
const { compararHash } = require("../utils/bcrypt")
const { gerarToken } = require("../utils/jwt")
const { resolve } = require("path")
const { novoErro } = require('../utils/errorMsg')
const { Blob } = require('buffer')
const { salvarImagemAzure } = require('./blobController')
const dotenv = require("dotenv").config({ path: resolve(__dirname, "../", "../", ".env") })

function cadastrarFuncionario(funcionario, sequelize) {
    return new Promise(async (resolve, reject) => {
        try {
            const { NIF, nome, email, nivel_acesso } = funcionario

            sequelize.query("call cadastrar_funcionario(?,?,?,?)", {
                replacements: [NIF, nome, email, nivel_acesso],
                type: sequelize.QueryTypes.INSERT
            })
                .then((r) => resolve(r))
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


async function editarFuncionario(dadosFuncionario, foto, sequelize) {

    return new Promise(async (resolve, reject) => {
        try {
            console.log(dadosFuncionario)
            const { idFuncionario, NIF, nome, email, nivel_acesso } = dadosFuncionario

            // Verifica se o usuario existe no banco
            const funcionarioExistente = await pesquisarUnicoFuncionario(NIF, sequelize)
            console.log(funcionarioExistente)
            if (!!funcionarioExistente[0] == false) {
                reject(novoErro("Funcionario não encontrado", 404))
            }

            let linkImagem = ""
            if (!!foto == true) {
                linkImagem = await salvarImagemAzure("funcionario", foto)
                console.log("LINK FOTO:", linkImagem)
            }
            else {
                linkImagem = funcionarioExistente[0].foto
            }


            sequelize.query("call editar_funcionario(?,?,?,?,?,?)", {
                replacements: [idFuncionario, NIF, nome, email, linkImagem, nivel_acesso],
                type: sequelize.QueryTypes.INSERT
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

            const { email, senha } = funcionario

            const usuario_criptografado = await retornarSenhaCriptografada(email, sequelize)

            confirmarSenhaCriptografa(senha, usuario_criptografado)

            const usuario = await pesquisarUnicoFuncionario(usuario_criptografado.NIF, sequelize)

            // Deolve os dados do usuario sem a senha
            const { senha: _, CPF: __, ...dadosUsuario } = usuario

            //Gera o token para verificar se está logado
            const token = gerarToken(dadosUsuario[0].email, dadosUsuario[0].nome, "12h")

            sequelize.query("call logar_funcionario(? , ?)",
                {
                    replacements: [dadosUsuario[0].NIF, token],
                    type: sequelize.QueryTypes.UPDATE

                })
            // adiciona o token a resposta
            dadosUsuario[0].token = token

            resolve(dadosUsuario[0])

        }

        catch (err) {
            // Se der algum erro inesperado no processo
            reject(err)
        }
    })
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


function deslogarFuncionario(nif, token, req, sequelize) {

    return new Promise(async (resolve, reject) => {

        // Pesquisa se o funcionario existe

        const response = await pesquisarUnicoFuncionario(nif, sequelize)
        !!response == false ? reject(novoErro("Funcionario não entrado", 404)) : ""

        // Valida o token do usuario para deslogar

        if (token == req.funcionario.token) {
            sequelize.query("call deslogar_funcionario(?)", {
                replacements: [response[0].id_funcionario],
                type: sequelize.QueryTypes.UPDATE

            })
                .then((r) => resolve(r))
                .catch((e) => reject(e))
        }
        else {
            reject(novoErro("Não autorizado, token inválido.", 403))
        }
        // remove o token do banco

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