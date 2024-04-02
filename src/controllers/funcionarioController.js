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

module.exports = { cadastrarFuncionario, editarFuncionario };
