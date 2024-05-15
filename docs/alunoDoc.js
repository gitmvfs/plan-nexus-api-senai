/**
 * @swagger
 * tags:
 *   - name: Aluno
 *     description: Operações relacionadas a alunos do sistema
 * 
 * definitions:
 *   cadastroAlunoModelo:
 *     type: object
 *     properties:
 *       CPF:
 *         type: string
 *         required: true
 *       nome:
 *         type: string
 *         required: true
 *       email:
 *         type: string
 *         required: true
 *       fk_curso:
 *         type: string
 *         value: "1"
 *         required: true
 *       socioAapm:
 *         type: boolean
 *         required: true
 *       telefone:
 *         type: string
 *         required: false
 *       celular:
 *         type: string
 *         required: true
 * 
 * /aluno/cadastro/multiplos:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: nif
 *         in: header
 *         description: Nif do funcionário que está logado
 *         required: true
 *         type: string 
 *     tags:
 *       - Aluno
 *     summary: Cadastra excel com os alunos.
 *     description: Cadastra vários alunos.
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               alunosFile:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '201':
 *         description: Operação realizada
 *       '400':
 *         description: Dados inválidos.
 *       '403':
 *         description: Sem autorização.
 *       '500':
 *         description: Erro no banco de dados.
 * 
 * 
 * /aluno/cadastro/unico:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: nif
 *         in: header
 *         description: Nif do funcionário que está logado
 *         required: true
 *         type: string
 *     tags:
 *       - Aluno
 *     summary: Cadastrar novo aluno.
 *     description: Cadastra um novo aluno caso tenha permissão.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/cadastroAlunoModelo'
 *     responses:
 *       201:
 *         description: Aluno cadastrado com sucesso.
 *       400:
 *         description: Dados inválidos.
 *       403:
 *         description: Sem autorização.
 *       500:
 *         description: Erro no banco de dados.
 * 
 * 
 * /aluno/atualizar/unico:
 *   patch:
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: nif
 *         in: header
 *         description: Nif do funcionário que está logado
 *         required: true
 *         type: string
 *     tags:
 *       - Aluno
 *     summary: Cadastrar novo aluno.
 *     description: Cadastra um novo aluno caso tenha permissão.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/cadastroAlunoModelo'
 *     responses:
 *       201:
 *         description: Aluno cadastrado com sucesso.
 *       400:
 *         description: Dados inválidos.
 *       403:
 *         description: Sem autorização.
 *       500:
 *         description: Erro no banco de dados.
 * 
 */
