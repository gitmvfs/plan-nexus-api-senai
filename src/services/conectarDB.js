const { resolve } = require("path")
const dotenv = require("dotenv").config({ path: resolve(__dirname, "../", "../", ".env") })
const {Sequelize} = require("sequelize")

//Conectando com o banco

const sequelize = new Sequelize(
    process.env.database_name,
    process.env.database_user_root,
    process.env.database_password_root, {
    host: process.env.database_host,
    dialect: "mysql"
})

module.exports = sequelize;