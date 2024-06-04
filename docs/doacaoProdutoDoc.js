/** 

* @swagger
* tags:
*   - name: doacaoProduto
*     description: Operações relacionadas a funcionários do sistema

* definitions:
*   editarDoacaoProduto:
*     type: object
*     properties:
*       idDoacao:
*         type: number
*       idAluno:
*         type: number
*       idProduto:
*         type: number
*       quantidade:
*         type: number
*       data:
*         type: string


*   cadastroDoacaoProduto:
*     type: object
*     properties:
*       idAluno:
*         type: number
*       idProduto:
*         type: number
*       quantidade:
*         type: number
*       contrato:
*         type: string
*       data:
*         type: string


* /doacaoProduto/todas:
*   get:
*     security:
*       - bearerAuth: []
*     parameters:
*       - name: nif
*         in: header
*         description: Nif do funcionario que está logado
*         required: true
*         type: string 
*     tags:
*       - doacaoProduto
*     summary: Pesquisa por todas as doacoes de Produto.    
*     description: Retorna as doacoes de camisas, bolsas, etc do banco de dados
*     responses:
*       200:
*         description: Consulta realizada com sucesso.
*       404:
*         description: Funcionario não encontrado .

* /doacaoProduto/cadastro:
*   post:
*     security:
*       - bearerAuth: []
*     parameters:
*       - name: nif
*         in: header
*         description: Nif do funcionario que está logado
*         required: true
*         type: string
*     requestBody:
*       required: true
*       content:
*         multipart/form-data:
*           schema:
*             type: object
*             properties:
*               idAluno:
*                 type: number
*               idProduto:
*                 type: number
*               quantidade:
*                 type: number
*               contrato:
*                 type: string
*                 format: binary
*               data:
*                 type: string
*     tags:
*       - doacaoProduto
*     summary: cadastro de doação de Produto
*     description: fazer registro de doação de Produto com id do aluno, id do produto, quantidade, contrato e data da doação
*     responses:
*       200:
*         description: cadastro bem sucedido.
*       500:
*         description: erro ao fazer cadastro.

* /doacaoProduto/atualizar:
*   patch:
*     security:
*       - bearerAuth: []
*     parameters:
*       - name: nif
*         in: header
*         description: Nif do funcionario que está logado
*         required: true
*         type: string
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/definitions/editarDoacaoProduto'  
*     tags:
*       - doacaoProduto
*     summary: Atualiza os dados da doação de Produto.    
*     description: Atualiza id do aluno, id do produto, quantidade e data da doação a partir do id da doação
*     responses:
*       200:
*         description: doação atualizada com sucesso.
*       400:
*         description: erro ao atualizar doação de Produto.


*/