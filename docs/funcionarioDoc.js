/**
 * @swagger
 * tags:
*   - name: Funcionario
*     description: Operações relacionadas a funcionários do sistema

* components:
*  securitySchemes:
*    bearerAuth:            # arbitrary name for the security scheme
*      type: http
*      scheme: bearer
*      bearerFormat: JWT    # optional, arbitrary value for documentation purposes

* definitions:
*   funcionarioLoginModelo:
*     type: object
*     properties:
*       email:
*         type: string
*       senha:
*         type: string
* /funcionario/token:
*   post:
*     security:
*       - bearerAuth: []
*     parameters:
*       - name: nif
*         in: header
*         description: ID of the requested TaxFiling
*         required: true
*         type: string
*     tags:
*       - Funcionario
*     summary: Logar como funcionário.     # This line should be on a single line
*     description: Verifica se o login é válido e devolve as informações do usuário.
*     responses:
*       200:
*         description: logado com sucesso (retorna o token).
*       400:
*         description: Usuário ou senha incorretos.
*       500:
*         description: Erro no banco de dados.

 */