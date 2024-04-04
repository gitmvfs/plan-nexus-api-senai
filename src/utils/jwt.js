const jwt = require("jsonwebtoken")
const {resolve} = require("path")
const dotenv = require("dotenv").config({ path: resolve(__dirname, "../", "../", ".env") })

function gerarToken(email, nome, expiracao) {

    const payload = {
        sub: email,
        name: nome,
    }

    const secretKey =  process.env.jwt_secret  || "senai115"

    const token = jwt.sign(payload, secretKey, { expiresIn: expiracao })

    return  token
}

function tokenValido(token) {

    const tokenDecodificado = jwt.decode(token)

    if (!tokenDecodificado || !tokenDecodificado.exp) {
        return false; // Token inválido ou sem data de expiração
    }

    const dataExpiracaoToken =  new Date (tokenDecodificado.exp * 1000)
    const dataAtual = new Date();

    return dataAtual > dataExpiracaoToken ? false : true  

    //Se o token for inválido ele retorna false, se o token for valido ele retorna true
}


module.exports = {gerarToken, tokenValido}