const funcionarioModel = require("../models/funcionarioModel");
const { novoErro, tratarMensagensDeErro } = require("../utils/errorMsg");
const { resolve } = require("path")
const dotenv = require("dotenv").config({ path: resolve(__dirname, "../", "../", ".env") })
const { Sequelize } = require("sequelize")
const jwt = require("jsonwebtoken")

function validarDataToken(token) {

    return new Promise((resolve, reject) => {

        const tokenDecodificado = jwt.decode(token)

        if (!tokenDecodificado || !tokenDecodificado.exp) {
            reject(novoErro("Token inválido", 403))  // Token inválido ou sem data de expiração
            console.log(tokenDecodificado)
        }

        const dataExpiracaoToken = new Date(tokenDecodificado.exp * 1000)
        const dataAtual = new Date();

        if (dataExpiracaoToken < dataAtual) {
            reject(novoErro("Token expirado", 403))
        }
        resolve(true)
    })
}

async function encontrarFuncionarioLogin(nif, token) {

    return new Promise(async (resolve, reject) => {
        try {
            // Se conecta usando um usuario q só tem acesso a uma view de login
            const sequelize = new Sequelize({
                database: process.env.database_name,
                username: process.env.database_user_root, // dps atualizar para o login funcionario
                password: process.env.database_password_root, // dps atualizar para o senha funcionario
                host: process.env.database_host,
                dialect: 'mysql'
            });

            if (nif && token) {
                const response = await funcionarioModel(sequelize).findOne({
                    where: {
                        NIF: nif,
                        token: token.replace("\"", "")
                    }
                })
                if (!!response == false) {
                    reject(novoErro("Nif ou token inválidos, permissão negada.", 403))
                }

                resolve(response)
            }
            else {
                reject(novoErro("Token ou nif vazios",400))
            }
        }
        catch (err) {
            reject(err)
        }
    })

}

function definirPermissaoNoBanco(funcionario) {

    let usuarioBanco = ""
    let senhaBanco = ""


    switch (funcionario.fk_nivel_acesso) {
        case 1:
            usuarioBanco = process.env.database_user_diretoria
            senhaBanco = process.env.database_password_diretoria
            break;
        case 2:
            usuarioBanco = process.env.database_user_diretoria
            senhaBanco = process.env.database_password_diretoria
            break;
        case 3:
            usuarioBanco = process.env.database_user_admin
            senhaBanco = process.env.database_password_admin
            break;
        default:
            usuarioBanco = ""
            senhaBanco = ""

            break;
    }

    return { usuarioBanco, senhaBanco }
}

function criarConexaoBanco(usuarioBanco, senhaBanco) {

    const sequelize = new Sequelize({
        database: process.env.database_name,
        username: usuarioBanco,
        password: senhaBanco,
        host: process.env.database_host,
        dialect: 'mysql'
    });

    return sequelize

}
const authMiddleware = (req, res, next) => {
    // Faça a autenticação do usuário e obtenha as informações necessárias

    return new Promise(async (resolve, reject) => {

        try {
            const { nif } = req.headers
            let token = req.headers.authorization || " "

            if (!!nif == false || !!token == false) {
                novoErro("Usuario ou token inválidos, permissão negada", 403)
                return
            }

            token = token.split(" ")[1]

            await validarDataToken(token)
                .catch((e) => {novoErro("Token inválido ou expirado", 403); return})

            const funcionario = await encontrarFuncionarioLogin(nif, token) // procura o funcionario no banco

            const { usuarioBanco, senhaBanco } = definirPermissaoNoBanco(funcionario) // define a permissão dele de acordo com o banco

            const sequelize = criarConexaoBanco(usuarioBanco, senhaBanco) // cria uma conexão no banco com o nivel da permissão

            //Autentica a conexão no banco de dados
            await sequelize.authenticate()
                .catch((e) => novoErro("Erro ao autenticar usuario do banco", 500))


            // Define o req.sequelize 
            req.sequelize = sequelize
            req.funcionario = { nif, token }
            // Prossiga para a próxima etapa da requisição
            next();
        }
        catch (err) {
            console.log("\n ------------------------------------------------------------------------------")

            console.log("ERRO DURANTE AUTH:", err)
            console.log("\n ------------------------------------------------------------------------------")
            next()
        }

    })

};

module.exports = { authMiddleware, validarDataToken }
