const express = require("express")
const app = express()
const dotenv = require("dotenv")
const { resolve } = require("path")
const bodyParser = require("body-parser")
const cors = require("cors")

//Importando as rotas
const alunosRota = require("./routes/alunoRota")
const armarioRota = require("./routes/armarioRota")
const funcionarioRota = require("./routes/funcionarioRota")
const produtoRota = require("./routes/produtoRota")
const doacaoDinheiroRota = require("./routes/doacaoDinheiroRota")
const doacaoArmarioRota = require("./routes/doacaoArmarioRota")
// Config dotenv
dotenv.config({ path: resolve("../", ".env") })
const serverPort = process.env.PORT || 3333

//Configuração dos middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())


//Configurando rotas
app.use("/funcionario", funcionarioRota)
app.use("/aluno", alunosRota)
app.use("/armario", armarioRota)
app.use("/produto", produtoRota)
app.use("/doacaoDinheiro", doacaoDinheiroRota)
app.use("/doacaoArmario", doacaoArmarioRota)

app.listen(serverPort, () => console.log(`HTTP RUNNING AT: http://localhost:${serverPort}`))
