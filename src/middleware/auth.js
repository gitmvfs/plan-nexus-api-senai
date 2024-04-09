const funcionarioModel = require("../models/funcionarioModel");
const { novoErro, tratarMensagensDeErro } = require("../utils/errorMsg");
const { resolve } = require("path")
const dotenv = require("dotenv").config({ path: resolve(__dirname, "../", "../", ".env") })
const {Sequelize} = require("sequelize")



const authMiddleware = (req, res, next) => {
    // Faça a autenticação do usuário e obtenha as informações necessárias

    return new Promise(async (resolve, reject) => {

        try {
            let usuarioBanco = ""
            let senhaBanco = ""
            const { nif, token } = req.headers

            if(!!nif == false || !!token == false){
                novoErro("Usuario ou token inválidos, permissão negada",403)
            }

            //Procura pelo usuario
            const funcionario = await funcionarioModel.findOne({
                where: {
                    nif,
                }
            })

            if (!!funcionario == false) {
                novoErro("Usuario ou token inválidos, permissão negada.", 403)
            }

            // Define qual usuario ira logar
            // console.log(funcionario.fk_nivel_acesso)

            switch (funcionario.fk_nivel_acesso) {
                case 2:
                    usuarioBanco = process.env.database_user_diretoria
                    senhaBanco = process.env.database_password_diretoria
                    break;
                case 3:
                    usuarioBanco = process.env.database_user_admin
                    senhaBanco = process.env.database_password_admin
                    break;
                default:
                    usuarioBanco = process.env.database_user_conselho
                    senhaBanco = process.env.database_password_conselho

                    break;
            }


            console.log(" teste14:" ,usuarioBanco,senhaBanco)

            // Configure a conexão do Sequelize com base no usuário
            const sequelize = new Sequelize({
                database: process.env.database_name,
                username: usuarioBanco,
                password: senhaBanco,
                host: process.env.database_host,
                dialect: 'mysql'
            });

            //Autentica a conexão no banco de dados
            await sequelize.authenticate()
            .catch((e) => novoErro(e.message,500))            
           
           // Define o req.sequelize 
            req.sequelize = sequelize



            // Prossiga para a próxima etapa da requisição
            next();
        }
        catch (err) {
            const erroTratado = await tratarMensagensDeErro(err)
            res.status(erroTratado.status).json({ errMsg: erroTratado.message, "statusCode": erroTratado.status })
        }

    })

};

module.exports = authMiddleware