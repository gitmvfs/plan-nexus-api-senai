/** 

* @swagger
* tags:
*   - name: doacaoDinheiro
*     description: Operações relacionadas a funcionários do sistema

* definitions:
*   editarDoacaoDinheiro:
*     type: object
*     properties:
*       idDoacao:
*         type: number
*       valorDoado:
*         type: number
*       idAluno:
*         type: number
*       auxilio:
*         type: number
*       data:
*         type: string


*   cadastroDoacaoDinheiro:
*     type: object
*     properties:
*       valorDoado:
*         type: number
*       idAluno:
*         type: number
*       auxilio:
*         type: number
*       contrato:
*         type: string
*         format: binary
*       data:
*         type: string

* /doacaoDinheiro/todos:
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
*       - doacaoDinheiro
*     summary: Pesquisa por todas as doacoes de Dinheiro.    
*     description: Retorna as doacoes monetárias do banco de dados
*     responses:
*       200:
*         description: Consulta realizada com sucesso.
*       404:
*         description: Funcionario não encontrado .

* /doacaoDinheiro/cadastro:
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
*               valorDoado:
*                 type: number
*               idAluno:
*                 type: number
*               auxilio:
*                 type: number
*               contrato:
*                 type: string
*                 format: binary
*               data:
*                 type: string
*                 format: date

*     tags:
*       - doacaoDinheiro
*     summary: cadastro de doação de Dinheiro
*     description: fazer registro de doação de Dinheiro com valor doados, id do aluno, data e tipo de auxilio
*     responses:
*       200:
*         description: cadastro bem sucedido.
*       500:
*         description: erro ao fazer cadastro.

* /doacaoDinheiro/atualizar:
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
*             $ref: '#/definitions/editarDoacaoDinheiro'  
*     tags:
*       - doacaoDinheiro
*     summary: Atualiza os dados da doação de dinheiro.    
*     description: Atualiza valor, tipo, id do aluno e data.
*     responses:
*       200:
*         description: doação atualizada com sucesso.
*       400:
*         description: erro ao atualizar doação de Dinheiro.


*/