/** 

* @swagger
* tags:
*   - name: doacaoArmario
*     description: Operações relacionadas a funcionários do sistema

* definitions:
*   editarDoacaoArmario:
*     type: object
*     properties:
*       idDoacao:
*         type: number
*       numeroArmario:
*         type: number
*       idAluno:
*         type: number
*       data:
*         type: string


*   cadastroDoacaoArmario:
*     type: object
*     properties:
*       numeroArmario:
*         type: number
*       idAluno:
*         type: number
*       contrato:
*         type: string
*       data:
*         type: string


* /doacaoArmario/todos:
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
*       - doacaoArmario
*     summary: Pesquisa por todas as doacoes de armario.    
*     description: Retorna as doacoes de armarios do banco de dados
*     responses:
*       200:
*         description: Consulta realizada com sucesso.
*       404:
*         description: Funcionario não encontrado .

* /doacaoArmario/cadastro:
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
*             $ref: '#/definitions/cadastroDoacaoArmario' 
*     tags:
*       - doacaoArmario
*     summary: cadastro de doação de armario
*     description: fazer registro de doação de armario com numero, id do aluno e data
*     responses:
*       200:
*         description: cadastro bem sucedido.
*       500:
*         description: erro ao fazer cadastro.

* /doacaoArmario/atualizar:
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
*             $ref: '#/definitions/editarDoacaoArmario'  
*     tags:
*       - doacaoArmario
*     summary: Atualiza os dados da doação de armário.    
*     description: Atualiza status e aluno usuário do armário
*     responses:
*       200:
*         description: doação atualizada com sucesso.
*       400:
*         description: erro ao atualizar doação de armario.


*/