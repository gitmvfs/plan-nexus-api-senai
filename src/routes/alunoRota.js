const router = require("express").Router()
const excelToJson = require("../utils/excelParseJson")
const { uploadArquivoAlunos } = require("../utils/salvarExcel")

router.post("/cadastrar/multiplos", uploadArquivoAlunos.single("alunosFile"), (req, res) => {

    const responseJson = excelToJson(req.file.path)
    res.json({data:responseJson})

})


module.exports = router