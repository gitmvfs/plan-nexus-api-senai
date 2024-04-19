const { Sequelize, DATE } = require('sequelize')
const funcionarioModel = require('../models/funcionarioModel')
const { compararHash } = require("../utils/bcrypt")
const { gerarToken } = require("../utils/jwt")
const { resolve } = require("path")
const { novoErro } = require('../utils/errorMsg')
const dotenv = require("dotenv").config({ path: resolve(__dirname, "../", "../", ".env") })

async function emailExiste(email, sequelize) {
    const funcionario = await funcionarioModel(sequelize).findOne({ where: { email: email } })
    return funcionario !== null
}

function cadastrarFuncionario(funcionario, sequelize) {
    return new Promise(async (resolve, reject) => {
        try {
            const {NIF,nome,email,nivel_acesso} = funcionario

            sequelize.query("call cadastrar_funcionario(?,?,?,?)", {
                replacements: [ NIF, nome, email, nivel_acesso],
                type: sequelize.QueryTypes.INSERT
            })
            .then((r)=> resolve(r))
            .catch((e)=> reject(e))
        } catch (err) {
            reject(err)
        }
    })
}

async function encontrarFuncionarioPorNIF(NIF, sequelize) {
    return funcionarioModel(sequelize).findOne({ where: { NIF: NIF } });
}

function pesquisarUnicoFuncionario(NIF, sequelize) {
    return new Promise(async (resolve, reject) => {
        try {
            const funcionario = await funcionarioModel(sequelize).findOne({ where: { NIF }, attributes: { exclude: ['senha'] } })

            if (!funcionario) {
                reject("Funcionário não encontrado para o NIF fornecido.")
                return
            }

            resolve(funcionario.dataValues)
        } catch (error) {
            reject(error)
        }
    })
}


async function editarFuncionario(NIF, novosDados, sequelize) {

    return new Promise(async (resolve, reject) => {
        try {
            const funcionarioExistente = await encontrarFuncionarioPorNIF(NIF, sequelize)
            if (!funcionarioExistente) {
                return res.status(404).send('Funcionário não encontrado.')
            }

            await funcionarioModel.update(sequelize)(novosDados, { where: { NIF: NIF } });

            resolve("Funcionário atualizado com sucesso.");
        } catch (err) {
            reject(err);
        }
    });
}

async function loginFuncionario(funcionario) {

    return new Promise(async (resolve, reject) => {

        try {

            const sequelize_login = new Sequelize({
                database: process.env.database_name,
                username: process.env.database_user_root, // dps atualizar para o login funcionario
                password: process.env.database_password_root, // dps atualizar para o senha funcionario
                host: process.env.database_host,
                dialect: 'mysql'
            });

            const { email, senha } = funcionario

            // verifica se o usuario existe
            let usuario = await funcionarioModel(sequelize_login).findOne({
                where: {
                    email
                }
            })

            // Caso o usuario não exista
            !!usuario == true
                ? usuario = usuario.dataValues
                : (() => { resolve(null) })()

            //Confirma se o hash da senha está certo.
            const confirmarSenha = await compararHash(funcionario.senha, usuario.senha)

            if (!confirmarSenha) {
                resolve(null)
            }

            // Deolve os dados do usuario sem a senha
            let { senha: _, CPF: __, ...resposta } = usuario

            //Gera o token para verificar se está logado
            resposta.token = gerarToken(resposta.email, resposta.nome, "12h")

            await funcionarioModel(sequelize_login).update({
                token: resposta.token
            },
                {
                    where: {
                        email
                    }
                })

            resolve(resposta)
        }
        catch (err) {
            // Se der algum erro inesperado no processo
            reject(err)
        }
    })
}

function pesquisarTodosFuncionarios(sequelize) {

    return new Promise(async(resolve, reject) => {
        try {

           await sequelize.query("select * from todos_funcionarios order by nome;")
            .then((r) => resolve(r[0]))
            .catch((e)=>reject(e))
        
        } catch (error) {
            reject(error)
        }
    })
}


function deslogarFuncionario(nif,token,sequelize){

    return new Promise((resolve,reject)=>{

        funcionarioModel(sequelize).update(
            {token: null},
            {
            where:{
                NIF:nif,
                token
            }
        })
        .then((r)=> resolve(r))
        .catch((e)=> reject(e))
        

    })


}

module.exports = { cadastrarFuncionario, pesquisarTodosFuncionarios, pesquisarUnicoFuncionario, editarFuncionario, loginFuncionario , deslogarFuncionario};
