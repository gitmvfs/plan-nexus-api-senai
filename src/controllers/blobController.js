const { Readable } = require("stream");
const azureStorage = require("azure-storage");
const { resolve } = require("path")

//Env
const dotenv = require("dotenv").config({ path: resolve(".env") })
const blobService = azureStorage.createBlobService(process.env.BLOB_STRING);

function salvarImagemAzure(nomeContainer, arquivoImagem) {

    // Salva os dados do arquivo

    const imagemNome = arquivoImagem.originalname;
    const stream = new Readable();
    stream.push(arquivoImagem.buffer)
    stream.push(null)

    // Pega a extensão do arquivo para q possa ser reocnhecido no blob

    const opcoes = {
        contentSettings: {
            contentType: arquivoImagem.mimetype,
        },
    }

    // Cria uma promisse tentando salvar o arquivo no banco

    return new Promise((resolve, reject) => {

        blobService.createBlockBlobFromStream(nomeContainer, imagemNome, stream, arquivoImagem.size, opcoes,
            (error, result, response) => { // Callback da resposta 
                if (error) {
                    console.log("Error ao salvar:" + error)
                    reject(error);
                } else {
                    const imageUrl = blobService.getUrl(nomeContainer, imagemNome);
                    resolve(imageUrl);
                }
            }
        );
    });
}

function excluirImagemAzure(nomeContainer, nomeImagem) {
    return new Promise((resolve, reject) => {
        blobService.deleteBlob(nomeContainer, nomeImagem, (error, response) => {
            if (error) {
                console.error("Erro ao excluir imagem:", error);
                reject(error);
            } else {
                console.log("Imagem excluída com sucesso");
                resolve(true);
            }
        });
    });
}


module.exports =  {salvarImagemAzure, excluirImagemAzure}