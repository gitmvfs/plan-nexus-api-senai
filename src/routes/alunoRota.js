const router = require("express").Router()
const { uploadArquivoAlunos } = require("../utils/salvarExcel")

router.post("/cadastrar/multiplos", uploadArquivoAlunos.single("alunosFile"), (req, res) => {

    console.log(req.file.path)
    res.json("ok")

})


module.exports = router