const multer = require("multer")
const { resolve } = require("path")
const dataLocal = require("./data")


//Configura aonde será armazenado os arquivos de Excel do cadastro de alunos

const armazenarCadastroAlunos = multer.diskStorage({
    destination: resolve("src", "historico", "CadastroAlunos"), // Define o local onde os arquivos serão salvos

    filename: function (req, file, cb) {
        const nomeArquivo = "arquivo-upload-" + dataLocal() + ".xls"; // Define o nome do arquivo
        cb(null, nomeArquivo); // Função de CallBack (sendo sincero tá deprecated.)
    }
});


const uploadArquivoAlunos = multer({ storage: armazenarCadastroAlunos });


// Parte de configuração de upload de imagens

// Função de filtro para aceitar apenas imagens
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('O arquivo não é uma imagem!'), false);
    }
  };
  


// Biblioteca para aceitar arquivos de mídia

// Configuração do Multer para o upload de arquivos
const storageImagem = multer.memoryStorage();
const uploadImagem = multer({ storage: storageImagem , fileFilter: fileFilter});

module.exports = { uploadArquivoAlunos, uploadImagem  }
