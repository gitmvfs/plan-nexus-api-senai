/**
 * @swagger
 * tags:
 *   - name: Carrinho
 *     description: Operações relacionadas ao carrinho de compras dos alunos
 *
 * definitions:
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
 *
 * /aluno/carrinhoCompras/valor:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id_aluno
 *         in: header
 *         description: id do aluno que está logado
 *         required: true
 *         type: string
 *     tags:
 *       - Carrinho
 *     summary: pega o valor do carrinho de compras do aluno.
 *     description: pega o valor do carrinho de compras do aluno.
 *     responses:
 *       201:
 *         description: Item adicionado ao carrinho com sucesso.
 *       400:
 *         description: Dados inválidos.
 *       403:
 *         description: Sem autorização.
 *       500:
 *         description: Erro no banco de dados.
 *
 * /aluno/carrinhoCompras/desconto:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id_aluno
 *         in: header
 *         description: id do aluno que está logado
 *         required: true
 *         type: string
 *     tags:
 *       - Carrinho
 *     summary: pega o valor do carrinho de compras do aluno.
 *     description: pega o valor do carrinho de compras do aluno.
 *     responses:
 *       201:
 *         description: Item adicionado ao carrinho com sucesso.
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
 *       - Carrinho
 *     summary: Adiciona um item ao carrinho de compras do aluno.
 *     description: Adiciona um item ao carrinho de compras do aluno.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/carrinhoDeComprasAdicionar'
 *     responses:
 *       201:
 *         description: Item adicionado ao carrinho com sucesso.
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
 *       - Carrinho
 *     summary: Remove um item do carrinho de compras do aluno.
 *     description: Remove um item do carrinho de compras do aluno.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/carrinhoDeComprasRemover'
 *     responses:
 *       201:
 *         description: Item removido do carrinho com sucesso.
 *       400:
 *         description: Dados inválidos.
 *       403:
 *         description: Sem autorização.
 *       500:
 *         description: Erro no banco de dados.
 */
