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

async function encontrarFuncionarioPorNIF(NIF, sequelize) {
    return funcionarioModel(sequelize).findOne({ where: { NIF: NIF } });
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


async function editarFuncionario(NIF, dadosFuncionario, sequelize) {

    return new Promise(async (resolve, reject) => {
        try {
            
            const { idFuncionario, NIF, nome, email, nivel_acesso } = dadosFuncionario
            let {foto} = dadosFuncionario

            // Verifica se a foto não foi enviada vazia, caso tenha sido é declarada como null para o banco
            if (!!foto == false){ foto = null}

            // console.log(idFuncionario,NIF, nome, email, nivel_acesso, foto)

            // Verifica se o usuario existe no banco
            const funcionarioExistente = await encontrarFuncionarioPorNIF(NIF, sequelize)
            if (!funcionarioExistente) {
                return res.status(404).send('Funcionário não encontrado.')
            }
            sequelize.query("call editar_funcionario(?,?,?,?,?,?)", {
                replacements: [idFuncionario, NIF, nome, email, foto, nivel_acesso],
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

            const sequelize_login = new Sequelize({
                database: process.env.database_name,
                username: process.env.database_user_root, // dps atualizar para o login funcionario
                password: process.env.database_password_root, // dps atualizar para o senha funcionario
                host: process.env.database_host,
                dialect: 'mysql'
            });

            const { email, senha } = funcionario

            const usuario = await retornarSenhaCriptografada(email,sequelize_login)
            confirmarSenhaCriptografa(senha,usuario)
            
            const response = await pesquisarUnicoFuncionario(usuario.NIF,sequelize_login)

            // Deolve os dados do usuario sem a senha
            let { senha: _, CPF: __, ...resposta } = response

            //Gera o token para verificar se está logado
            resposta.token = gerarToken(resposta.email, resposta.nome, "12h")

                token: resposta.token
                resolve(resposta)
           
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


function deslogarFuncionario(nif, token, req,sequelize) {

    return new Promise( async(resolve, reject) => {

        // Pesquisa se o funcionario existe

        const response =  await pesquisarUnicoFuncionario(nif,sequelize)
        !!response == false? novoErro("Funcionario não entrado", 404):""

        // Valida o token do usuario para deslogar

        if (token == req.funcionario.token){
            sequelize.query("call deslogar_funcionario(?)", {
                replacements: [response[0].id_funcionario],
                type: sequelize.QueryTypes.UPDATE
    
            })
                .then((r) => resolve(r))
                .catch((e) => reject(e))
        }
        else {
            novoErro("Não autorizado, token inválido.", 403)
        }
        // remove o token do banco
        
    })


}

function retornarSenhaCriptografada(email,sequelize_login){

    return new Promise(async(resolve, reject) => {
        const senhaCriptografada = await sequelize_login.query("select * from buscar_senhas_funcionario where email = ?", {
            replacements:[email],
            type: sequelize_login.QueryTypes.SELECT
        })
        
        // Caso o usuario não exista
        !!senhaCriptografada[0] == false
            ? novoErro("Usuario ou senha inválidos", 403)
            : ""
        
        resolve(senhaCriptografada[0])
    })
}

function confirmarSenhaCriptografa(senha,senhaCriptografada){

    return new Promise(async(resolve, reject) => {
        const confirmarSenha = await compararHash(senha, senhaCriptografada.senha)

        if (!confirmarSenha) {
            novoErro("Usuario ou senha inválidos", 403)
        }
    })

}

module.exports = { cadastrarFuncionario, pesquisarTodosFuncionarios, pesquisarUnicoFuncionario, editarFuncionario, loginFuncionario, deslogarFuncionario };