const multer = require("multer")
const { resolve } = require("path")
const dataLocal = require("../utils/data")


//Configura aonde será armazenado os arquivos de Excel do cadastro de alunos

const armazenarCadastroAlunos = multer.diskStorage({
    destination: resolve("src", "historico", "CadastroAlunos"), // Define o local onde os arquivos serão salvos

    filename: function (req, file, cb) {
        const nomeArquivo = "arquivo-upload-" + dataLocal() + ".xls"; // Define o nome do arquivo
        cb(null, nomeArquivo); // Função de CallBack (sendo sincero tá deprecated.)
    }
});


const uploadArquivoAlunos = multer({ storage: armazenarCadastroAlunos });

module.exports = { uploadArquivoAlunos }
