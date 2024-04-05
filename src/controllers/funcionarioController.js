const funcionarioModel = require('../models/funcionarioModel')

async function emailExiste(email) {
    const funcionario = await funcionarioModel.findOne({ where: { email: email } })
    return funcionario !== null
}

function cadastrarFuncionario(funcionario) {
    return new Promise(async (resolve, reject) => {
        try {
            const emailJaExiste = await emailExiste(funcionario.email)
            if (emailJaExiste) {
                reject("Email já existe no banco de dados.")
                return;
            }
            
            await funcionarioModel.create({
                NIF: funcionario.NIF,
                nome: funcionario.nome,
                email: funcionario.email,
                fk_nivel_acesso: funcionario.nivel_acesso
            });
            resolve("Funcionário cadastrado com sucesso.")
        } catch (err) {
            reject(err)
        }
    })
}

async function encontrarFuncionarioPorNIF(NIF) {
    return funcionarioModel.findOne({ where: { NIF: NIF } });
}

function pesquisarTodosFuncionarios() {
    return new Promise(async (resolve, reject) => {
        try {
            const listaFuncionarios = []
            const funcionarios = await funcionarioModel.findAll({ attributes: { exclude: ['senha'] } })

            if (funcionarios.length === 0) {
                reject("Funcionários não encontrados, verifique os filtros.")
                return
            }

            funcionarios.forEach((funcionario) => {
                listaFuncionarios.push(funcionario.dataValues)
            })

            resolve(listaFuncionarios)
        } catch (error) {
            reject(error)
        }
    })
}

function pesquisarUnicoFuncionario(NIF) {
    return new Promise(async (resolve, reject) => {
        try {
            const funcionario = await funcionarioModel.findOne({ where: { NIF }, attributes: { exclude: ['senha'] } })

            if (!funcionario) {
                reject("Funcionário não encontrado para o NIF fornecido.")
                return
            }

            resolve(funcionario.dataValues)
        } catch (error) {
            reject(error)
        }
    })
}

async function editarFuncionario(NIF, novosDados) {
    return new Promise(async (resolve, reject) => {
        try {
            const funcionarioExistente = await encontrarFuncionarioPorNIF(NIF)
            if (!funcionarioExistente) {
                return res.status(404).send('Funcionário não encontrado.')
            }

            await funcionarioModel.update(novosDados, { where: { NIF: NIF } });

            resolve("Funcionário atualizado com sucesso.");
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = { cadastrarFuncionario, pesquisarTodosFuncionarios, pesquisarUnicoFuncionario, editarFuncionario };
