const express = require("express")
const app = express()
const dotenv = require("dotenv")
const { resolve } = require("path")
const bodyParser = require("body-parser")
const cors = require("cors")
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");

//Importando as rotas
const alunosRota = require("./routes/alunoRota")
const armarioRota = require("./routes/armarioRota")
const funcionarioRota = require("./routes/funcionarioRota")
const produtoRota = require("./routes/produtoRota")
const doacaoDinheiroRota = require("./routes/doacaoDinheiroRota")
const doacaoArmarioRota = require("./routes/doacaoArmarioRota")
const reservaRota = require("./routes/reservaRota")
const turmaRota = require("./routes/turmaRota")
const associadoRota = require("./routes/associadoRota")
// Config dotenv
dotenv.config({ path: resolve("../", ".env") })
const serverPort = process.env.PORT || 3333

//Configuração dos middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())

// Configurações da rota de documentação


const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Api Gestão Senai ERP",
        version: "1.0.0",
        description:
          "A api tem como função desenvolver um modelo crud de ecommerce",
      },
    },
    apis: ["./docs/*.js"],
  };
  
  const swaggerSpec = swaggerJSDoc(options);
  
  // Use o Swagger UI Express para servir a documentação Swagger
  app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
  


//Configurando rotas
app.use("/funcionario", funcionarioRota)
app.use("/aluno", alunosRota)
app.use("/armario", armarioRota)
app.use("/produto", produtoRota)
app.use("/doacaoDinheiro", doacaoDinheiroRota)
app.use("/doacaoArmario", doacaoArmarioRota)
app.use("/reserva", reservaRota)
app.use("/turma", turmaRota)
app.use("/associado", associadoRota)

app.listen(serverPort, () => console.log(`HTTP RUNNING AT: http://localhost:${serverPort}`))
