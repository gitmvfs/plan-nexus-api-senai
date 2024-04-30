/** 

* @swagger
* tags:
*   - name: Turma
*     description: Operações relacionadas a funcionários do sistema



* /turma/todos:
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
*       - Turma
*     summary: Pesquisa por todas as turmas.    
*     description: Retorna as turmas do banco de dados
*     responses:
*       200:
*         description: Usuario consultado com sucesso.
*       404:
*         description: Funcionario não encontrado .

*/