function tratarMensagensDeErro(err) {

    try {
        let errMsg = err.errors[0].message

        if (errMsg.includes("PRIMARY must be unique")) errMsg = "Dado já cadastrado, consulte os relatórios ou contate o administrador.";

        return errMsg
    }
    catch{
        return "Mensagem de erro não tratada :" + err
    }
}
module.exports = tratarMensagensDeErro