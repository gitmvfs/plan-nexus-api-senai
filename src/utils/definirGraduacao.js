function definirGraduacao(objeto) {

    // const listaCursosTecnicos = ["técnico", "técnica", "tecnico", "tecnica"] // palavras-chaves para cursos técnicos
    const listaCursosSuperiores = ["técnologico", "técnologo", "bacharelado", "graduação", "extensão"] // palavras-chaves para cursos superiores

    //Compara se a lista é de curso superior
    for (const palavraChave of listaCursosSuperiores) {

        if (objeto.Tipo.toLowerCase().includes(palavraChave)) {
            objeto.Tipo = "superior";
            break; // Se encontrou, pode parar a iteração
        }
    }

    //Se não for superior é tecnico

    if (!objeto.Tipo.includes("superior")) {
        objeto.Tipo = "tecnico"
    }

    return objeto.Tipo

}

module.exports = definirGraduacao