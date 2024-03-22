const { z } = require("zod")

const alunoUnicoValidacao = z.object({
    CPF: z.string().length(11, "O cpf precisa ter 11 digitos").min(1, "Cpf não pode estar vazio"),
    nome: z.string().min(1, "Nome não pode estar vazio"),
    email: z.string().email("Email inválido.").min(1, "Email não pode estar vazio"),
    fk_curso: z.number().min(1, "Curso não pode estar vazio"),
    socioAapm: z.boolean(),
})

const validacoesGerais = {
    CPF: z.string().length(11, "O cpf precisa ter 11 digitos").min(1, "Cpf não pode estar vazio"),
    nome: z.string().min(1, "Nome não pode estar vazio"),
    email: z.string().email("Email inválido.").min(1, "Email não pode estar vazio"),
    fk_curso: z.number().min(1, "Curso não pode estar vazio"),

}

module.exports = { alunoUnicoValidacao, validacoesGerais }