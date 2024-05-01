/** 

* @swagger
* tags:
*   - name: Armario
*     description: Operações relacionadas a funcionários do sistema

* definitions:
*   atualizarArmario:
*     type: object
*     properties:
*       numeroArmario:
*         type: number
*       idAluno:
*         type: number
*       statusArmario:
*         type: string


* /armario/todos:
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
*       - Armario
*     summary: Pesquisa por todos os armarios.    
*     description: Retorna os armarios do banco de dados
*     responses:
*       200:
*         description: Consulta realizada com sucesso.
*       404:
*         description: Funcionario não encontrado .

* /armario/{statusArmario}:
*   get:
*     security:
*       - bearerAuth: []
*     parameters:
*       - name: nif
*         in: header
*         description: Nif do funcionario que está logado
*         required: true
*         type: string
*       - name: statusArmario
*         in: path
*         description: status
*         required: true
*         type: string
*     tags:
*       - Armario
*     summary: Pesquisa por armario de acordo com o status.    
*     description: Retorna as armarios do banco
*     responses:
*       200:
*         description: consulta realizada com sucesso.
*       500:
*         description: erro ao fazer consulta.

* /armario/atualizar:
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
*             $ref: '#/definitions/atualizarArmario'  
*     tags:
*       - Armario
*     summary: Atualiza os dados do armário.    
*     description: Atualiza status e aluno usuário do armário
*     responses:
*       200:
*         description: armario atualizado com sucesso.
*       400:
*         description: erro ao atualizar armario.


*/