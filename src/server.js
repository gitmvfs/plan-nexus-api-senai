const express = require("express")
const app = express()
const dotenv = require("dotenv")
const { resolve } = require("path")
const bodyParser = require("body-parser")
const cors = require("cors")
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");
const rateLimit = require("express-rate-limit")

//Importando as rotas
const alunosRota = require("./routes/alunoRota")
const alunosSite = require("./routes/alunoSiteRota")
const armarioRota = require("./routes/armarioRota")
const funcionarioRota = require("./routes/funcionarioRota")
const produtoRota = require("./routes/produtoRota")
const doacaoDinheiroRota = require("./routes/doacaoDinheiroRota")
const doacaoArmarioRota = require("./routes/doacaoArmarioRota")
const reservaRota = require("./routes/reservaRota")
const turmaRota = require("./routes/turmaRota")
const associadoRota = require("./routes/associadoRota")
const doacaoProdutoRota = require("./routes/doacaoProdutoRota")
const smtpRota = require("./routes/smtpRota")

// Config dotenv
dotenv.config({ path: resolve("../", ".env") })
const serverPort = process.env.PORT || 3333

//Configuração dos middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())

// Configurar o limitador
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 50, // Limite de 100 requisições por IP a cada 15 minutos
  message: 'Muitas requisições neste IP, tente novamente mais tarde.',
  headers: true, // Inclui os cabeçalhos `RateLimit-*` na resposta
});

// Aplicar o limitador a todas as rotas
app.use(limiter);

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

app.use("/smtp", smtpRota)
app.use("/funcionario", funcionarioRota)
app.use("/aluno", alunosSite) // PARTE QUE FICA NO SITE DOS ALUNOS
app.use("/aluno", alunosRota) // PARTE QUE FICA NA GESTÃO
app.use("/armario", armarioRota)
app.use("/produto", produtoRota)
app.use("/doacaoDinheiro", doacaoDinheiroRota)
app.use("/doacaoArmario", doacaoArmarioRota)
app.use("/reserva", reservaRota)
app.use("/turma", turmaRota)
app.use("/associado", associadoRota)
app.use("/doacaoProduto", doacaoProdutoRota)

app.get("", (req,res) => {

  res.json({ server_status: "ok", api_v : "1.0.0"})

})

app.use((req, res, next) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});


app.listen(serverPort, "0.0.0.0" ,() => console.log(`HTTP RUNNING AT: http://localhost:${serverPort}`))
