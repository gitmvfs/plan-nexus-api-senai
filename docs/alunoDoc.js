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
 *   carrinhoDeComprasAdicionar:
 *     type: object
 *     properties:
 *       idProduto:
 *         type: "string"
 *       quantidade:
 *         type: "string"
 *
 *   carrinhoDeComprasRemover:
 *     type: object
 *     properties:
 *       idProduto:
 *         type: "string"

 *   alunoLoginModelo:
 *     type: object
 *     properties:
 *       email:
 *         type: string
 *       senha:
 *         type: string
 *
 *   editarAlunoModelo:
 *     type: object
 *     properties:
 *       idAluno:
 *         type: string
 *         required: true  
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
 * /aluno/carrinhoCompras/adicionar:
 *   patch:
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id_aluno
 *         in: header
 *         description: id do aluno que está logado
 *         required: true
 *         type: string
 *     tags:
 *       - Aluno
 *     summary: Define o carrinho de compras do aluno.
 *     description: Define o carrinho de compras do aluno 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/carrinhoDeComprasAdicionar'
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
  * /aluno/carrinhoCompras/remover:
 *   patch:
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id_aluno
 *         in: header
 *         description: id do aluno que está logado
 *         required: true
 *         type: string
 *     tags:
 *       - Aluno
 *     summary: Define o carrinho de compras do aluno.
 *     description: Define o carrinho de compras do aluno 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/carrinhoDeComprasRemover'
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
 * /aluno/atualizar:
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
 *             $ref: '#/definitions/editarAlunoModelo'
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
 * /aluno/todos:
 *   get:
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
 *     summary: Pega todos os alunos do banco.
 *     description: Pega todos os alunos do banco de dados.
 *     responses:
 *       201:
 *         description: Consulta realizada com sucesso
 *       403:
 *         description: Sem autorização.
 *       500:
 *         description: Erro no banco de dados.
 * 
 * 
 * /aluno/login:
 *   post:
 *     tags:
 *       - Aluno
 *     summary: Logar como aluno.     
 *     description: Verifica se o login é válido e devolve as informações do usuário.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/alunoLoginModelo'    
 *     responses:
 *       200:
 *         description: logado com sucesso (retorna o token).
 *       400:
 *         description: Usuário ou senha incorretos.
 *       500:
 *         description: Erro no banco de dados.

 */
