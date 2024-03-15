const express = require("express")
const app = express()
const dotenv = require("dotenv")
const { resolve } = require("path")
const bodyParser = require("body-parser")
const cors = require("cors")

//Importando as rotas
const alunosRota = require("./routes/alunoRota")


// Config dotenv
dotenv.config({ path: resolve("../", ".env") })
const serverPort = process.env.PORT || 3333

//Configuração dos middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())


//Configurando rotas
app.use("/aluno", alunosRota)

app.listen(serverPort, () => console.log(`HTTP RUNNING AT: http://localhost:${serverPort}`))
