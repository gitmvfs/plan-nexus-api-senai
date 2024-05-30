/**
 * @swagger
 * tags:
 *   - name: Smtp
 *     description: Operações relacionadas a alunos do sistema
 * 
 * /smtp/recuperarSenha:
 *   post:
 *     tags:
 *       - Smtp
 *     summary: Envia um e-mail com a recuperação de senha.
 *     description: Cadastra vários alunos.
 *     consumes:
 *       - application/json
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
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
 * /smtp/definirSenha/{token}:
 *   post:
 *     tags:
 *       - Smtp
 *     parameters:
 *       - in: path
 *         name: token   # Note the name is the same as in the path
 *         required: true
 *     summary: Envia um e-mail com a recuperação de senha.
 *     description: Cadastra vários alunos.
 *     consumes:
 *       - application/json
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               senha:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Operação realizada
 *       '400':
 *         description: Dados inválidos.
 *       '403':
 *         description: Sem autorização.
 *       '500':
 *         description: Erro no banco de dados. 
*/
