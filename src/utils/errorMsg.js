function tratarMensagensDeErro(err) {


    let errMsg = err.errors[0].message


    if(errMsg.includes("PRIMARY must be unique")) errMsg = "Dado já cadastrado, consulte os relatórios ou contate o administrador.";

    return errMsg
}

module.exports = tratarMensagensDeErro