const alunoModel = require("../models/alunoModel");
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

async function encontrarAlunoLogin(id_aluno, token) {

    return new Promise(async (resolve, reject) => {
        try{
                // Se conecta usando um usuario q só tem acesso a uma view de login
        const sequelize = new Sequelize({
            database: process.env.database_name,
            username: process.env.database_user_root, // dps atualizar para o login funcionario
            password: process.env.database_password_root, // dps atualizar para o senha funcionario
            host: process.env.database_host,
            dialect: 'mysql'
        });

        const response = await alunoModel(sequelize).findOne({
            where: {
                id_aluno: id_aluno,
                token:token.replace("\"","")
            }
        })
        if (!!response == false) {
            reject(novoErro("Id_aluno ou token inválidos, permissão negada.", 403))
        }

        resolve(response)
        }
    catch(err){
        reject(err)
    }
    })

}

function criarConexaoBanco(usuarioBanco, senhaBanco) {

    const sequelize = new Sequelize({
        database: process.env.database_name,
        username: "alunos",
        password: process.env.database_password_aluno,
        host: process.env.database_host,
        dialect: 'mysql'
    });

    return sequelize

}
const authMiddleware_aluno = (req, res, next) => {
    // Faça a autenticação do usuário e obtenha as informações necessárias

    return new Promise(async (resolve, reject) => {

        try {
            const { id_aluno } = req.headers
            let token = req.headers.authorization || " "

            token = token.split(" ")[1]

            if (!!id_aluno == false || !!token == false) {
                novoErro("Usuario ou token inválidos, permissão negada", 403)
            }

            await validarDataToken(token)
                .catch((e) => novoErro("Token inválido ou expirado", 403))

            const aluno = await encontrarAlunoLogin(id_aluno, token) // procura o funcionario no banco

            const sequelize = criarConexaoBanco() // cria uma conexão no banco com o nivel da permissão

            //Autentica a conexão no banco de dados
            await sequelize.authenticate()
                .catch((e) => novoErro("Erro ao autenticar usuario do banco", 500))


            // Define o req.sequelize 
            req.sequelize = sequelize
            req.aluno = { id_aluno, token }
            // Prossiga para a próxima etapa da requisição
            next();
        }
        catch (err) {
            const erroTratado = await tratarMensagensDeErro(err)
            res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
        }

    })

};

module.exports = {authMiddleware_aluno, validarDataToken}