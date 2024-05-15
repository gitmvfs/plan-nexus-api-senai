    /** 

* @swagger
* tags:
*   - name: Associado
*     description: Operações relacionadas a funcionários do sistema

* definitions:
*
*   associarAluno:
*     type: object
*     properties:
*       id_aluno:
*         type: number
*       brinde:
*         type: number
*       data_associacao:
*         type: string

*   deletarAssociado:
*     type: object
*     properties:
*       id_aluno:
*         type: number




* /associado/todos:
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
*       - Associado
*     summary: Pesquisa por todos os associados.    
*     description: Retorna os associados da AAPM do banco de dados
*     responses:
*       200:
*         description: consulta bem sucedida
*       404:
*         description: Funcionario não encontrado .
*       500:
*         description: associado ja existe.


* /associado/:
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
*         application/json:
*           schema:
*             $ref: '#/definitions/associarAluno'
*     tags:
*       - Associado
*     summary: Associar um aluno.    
*     description: Associa um aluno passando id do aluno, id do brinde e a data de associacao
*     responses:
*       201:
*         description: associacao bem sucedida
*       400:
*         description: dados invalidos.
*       500:
*         description: erro no server.

* /associado/delete:
*   delete:
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
*             $ref: '#/definitions/deletarAssociado'
*     tags:
*       - Associado
*     summary: Remover um associado.    
*     description: Remove um associado pelo id do aluno
*     responses:
*       201:
*         description: associacao bem sucedida
*       400:
*         description: dados invalidos.
*       500:
*         description: erro no server.


*/