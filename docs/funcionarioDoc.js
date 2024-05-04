/**
 * @swagger
 * tags:
*   - name: Funcionario
*     description: Operações relacionadas a funcionários do sistema

* components:
*  securitySchemes:
*    bearerAuth:            
*      type: http
*      scheme: bearer
*      bearerFormat: JWT    

* definitions:
*   funcionarioLoginModelo:
*     type: object
*     properties:
*       email:
*         type: string
*       senha:
*         type: string
*
*   cadastroFuncionarioModelo:
*     type: object
*     properties:
*       NIF:
*         type: string
*       nome:
*         type: string
*       email:
*         type: string
*       nivel_acesso:
*         type: string
*         value: "1"
*       foto:
*         type: string
*         required: false


*   editarFuncionarioModelo:
*     type: object
*     properties:
*       idFuncionario:
*         type: string
*       NIF:
*         type: string
*       nome:
*         type: string
*       email:
*         type: string
*       nivel_acesso:
*         type: number
*         "enum": [1,2,3]
*       foto:
*         type: string
*         required: false

*   pesquisarFuncionario:
*     type: object
*     properties:
*       NIF:
*         type: string

* /funcionario/login:
*   post:
*     tags:
*       - Funcionario
*     summary: Logar como funcionário.     
*     description: Verifica se o login é válido e devolve as informações do usuário.
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/definitions/funcionarioLoginModelo'    
*     responses:
*       200:
*         description: logado com sucesso (retorna o token).
*       400:
*         description: Usuário ou senha incorretos.
*       500:
*         description: Erro no banco de dados.


* /funcionario:
*   post:
*     security:
*       - bearerAuth: []
*     parameters:
*       - name: nif
*         in: header
*         description: Nif do funcionario que está logado
*         required: true
*         type: string
*     tags:
*       - Funcionario
*     summary: Cadastrar novo funcionário.     
*     description: Cadastra um novo funcionario caso tenha permissão.
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/definitions/cadastroFuncionarioModelo'    
*     responses:
*       201:
*         description: Funcionario cadastrado com sucesso.
*       400:
*         description: Dados inválidos.
*       403:
*         description: Sem autorização.  
*       500:
*         description: Erro no banco de dados.




* /funcionario/token:
*   post:
*     security:
*       - bearerAuth: []
*     parameters:
*       - name: nif
*         in: header
*         description: Nif do funcionario que está logado
*         required: true
*         type: string
*     tags:
*       - Funcionario
*     summary: Verifica se o token é valido.  
*     description: Valida o token para o front manter a sessão do usuário
*     responses:
*       200:
*         description: Retorna True      
*       500:
*         description: Erro no banco de dados.

* /funcionario/logout:
*   post:
*     security:
*       - bearerAuth: []
*     parameters:
*       - name: nif
*         in: header
*         description: Nif do funcionario que está logado
*         required: true
*         type: string
*     tags:
*       - Funcionario
*     summary: Deslogar funcionario.    
*     description: Caso o token e nif sejam válidos do detentor da conta, ele desloga apagando o nif do banco
*     responses:
*       200:
*         description: Usuario deslogado com sucesso (apaga o token do banco).
*       403:
*         description: Sem autorização para deslogar (Caso seja alguma outra conta) .
*       500:
*         description: Erro ao deslogar usuario.


* /funcionario/atualizar:
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
*             $ref: '#/definitions/editarFuncionarioModelo'  
*     tags:
*       - Funcionario
*     summary: Atualizar informações do usuario pelo nif.    
*     description: Caso o token e nif sejam válidos do detentor da conta, ele desloga apagando o nif do banco
*     responses:
*       200:
*         description: Consulta realizada com sucesso.
*       404:
*         description: Funcionario não encontrado .
*       500:
*         description: Erro ao atualizar usuario.


* /funcionario/todos:
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
*       - Funcionario
*     summary: Pesquisa todos os funcionarios.    
*     description: Retorna todos os funcionarios cadastrados no banco
*     responses:
*       200:
*         description: Usuario consultado com sucesso.
*       500:
*         description: Erro ao atualizar usuario.


* /funcionario/unico/{NIF}:
*   get:
*     security:
*       - bearerAuth: []
*     parameters:
*       - name: nif
*         in: header
*         description: Nif do funcionario que está logado
*         required: true
*         type: string 
*       - name: NIF
*         in: path
*         description: Nif do funcionario a ser pesquisado
*         required: true
*         type: string 
*     tags:
*       - Funcionario
*     summary: Pesquisa pelo nif do funcionario.    
*     description: Retorna o funcionario caso o nif esteja valido
*     responses:
*       200:
*         description: Usuario consultado com sucesso.
*       404:
*         description: Funcionario não encontrado .


* /funcionario/inativar/{NIF}:
*   patch:
*     security:
*       - bearerAuth: []
*     parameters:
*       - name: nif
*         in: header
*         description: Nif do funcionario que está logado
*         required: true
*         type: string 
*       - name: NIF
*         in: path
*         description: Nif do funcionario a ser inativado
*         required: true
*         type: string 
*     tags:
*       - Funcionario
*     summary: Inativar um funcionario.    
*     description: Muda o status de um funcionario para inativo a partir de seu nif
*     responses:
*       200:
*         description: Usuario inativado com sucesso.
*       404:
*         description: Funcionario não encontrado .




 */