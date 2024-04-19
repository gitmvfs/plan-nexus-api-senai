const { z } = require("zod")

const alunoUnicoValidacao = z.object({
    CPF: z.string().length(11, "O cpf precisa ter 11 digitos").min(1, "Cpf não pode estar vazio"),
    nome: z.string().min(1, "Nome não pode estar vazio"),
    email: z.string().email("Email inválido.").min(1, "Email não pode estar vazio"),
    fk_curso: z.string().min(1, "Curso não pode estar vazio"),
    socioAapm: z.boolean(),
    telefone: z.string().optional(),
    celular: z.string().min(1,"Número de celular obrigatório")
})

const validacoesGerais = {
    CPF: z.string().length(11, "O cpf precisa ter 11 digitos").min(1, "Cpf não pode estar vazio"),
    nome: z.string().min(1, "Nome não pode estar vazio"),
    email: z.string().email("Email inválido.").min(1, "Email não pode estar vazio"),
    fk_curso: z.number().min(1, "Curso não pode estar vazio"),

}

const produtoValidacao = z.object({
    nome: z.string().min(1, "O nome não pode estar vazio"),
    cores: z.array(z.string()).min(1, "As cores não podem estar vazias"),
    tamanhos: z.array(z.string()).min(1, "Os tamanhos não podem estar vazios"),
    fotos: z.record(z.unknown()),
    valor: z.number().min(1, "O valor não pode estar vazio"),
    descricao: z.string().max(150).nullable(),
    brinde: z.boolean(),
  });

module.exports = { alunoUnicoValidacao, validacoesGerais, produtoValidacao }