const funcionarioModel = require('../models/funcionarioModel')
const {compararHash} = require("../utils/bcrypt")
const {gerarToken} = require("../utils/jwt")

async function emailExiste(email,sequelize) {
    const funcionario = await funcionarioModel(sequelize).findOne({ where: { email: email } })
    return funcionario !== null
}

function cadastrarFuncionario(funcionario, sequelize) {
    return new Promise(async (resolve, reject) => {
        try {
            const emailJaExiste = await emailExiste(funcionario.email)
            if (emailJaExiste) {
                reject("Email já existe no banco de dados.")
                return;
            }
            
            await funcionarioModel(sequelize).create({
                NIF: funcionario.NIF,
                nome: funcionario.nome,
                email: funcionario.email,
                fk_nivel_acesso: funcionario.nivel_acesso
            });
            resolve("Funcionário cadastrado com sucesso.")
        } catch (err) {
            reject(err)
        }
    })
}

async function encontrarFuncionarioPorNIF(NIF,sequelize) {
    return funcionarioModel(sequelize).findOne({ where: { NIF: NIF } });
}


function pesquisarTodosFuncionarios(sequelize) {
    return new Promise(async (resolve, reject) => {
        try {
            const listaFuncionarios = []
            const funcionarios = await funcionarioModel(sequelize).findAll({ attributes: { exclude: ['senha'] } })

            if (funcionarios.length === 0) {
                reject("Funcionários não encontrados, verifique os filtros.")
                return
            }

            funcionarios.forEach((funcionario) => {
                listaFuncionarios.push(funcionario.dataValues)
            })

            resolve(listaFuncionarios)
        } catch (error) {
            reject(error)
        }
    })
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


async function editarFuncionario(NIF, novosDados,sequelize) {

    return new Promise(async (resolve, reject) => {
        try {
            const funcionarioExistente = await encontrarFuncionarioPorNIF(NIF,sequelize)
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

async function loginFuncionario(funcionario,sequelize){
    
    return new Promise(async (resolve, reject) => {

        try {

            const { email, senha } = funcionario

            // verifica se o usuario existe
            let usuario = await funcionarioModel(sequelize).findOne({
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

            await funcionarioModel(sequelize).update({
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

module.exports = { cadastrarFuncionario,pesquisarTodosFuncionarios,pesquisarUnicoFuncionario , editarFuncionario, loginFuncionario };
