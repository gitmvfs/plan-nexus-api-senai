/**
 * @swagger
 * tags:
*   - name: Produto
*     description: Operações relacionadas a funcionários do sistema

* definitions:
*   cadastroProduto:
*     type: object
*     properties:


* /produto/:
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
*       - Produto
*     summary: Cadastra novos produtos.     
*     description: Cadastra um novo produto.
*     consumes:
*       - multipart/form-data
*     requestBody:
*       required: true
*       content:
*         multipart/form-data:
*           schema:
*             type: object
*             properties:
*               preto:
*                 type: string
*                 format: binary
*               nome:
*                 type: string
*               descricao:
*                 type: string 
*               cores:
*                 type: array
*                 items:
*                   type: string
*               tamanhos:
*                 type: array
*                 items:
*                   type: string
*               desconto: 
*                 type: number
*               valor: 
*                 type: number
*               brinde:
*                 type: boolean
*     responses:
*       '201':
*         description: Funcionario cadastrado com sucesso.
*       '400':
*         description: Dados inválidos.
*       '403':
*         description: Sem autorização.  
*       '500':
*         description: Erro no banco de dados.


* /produto/todos:
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
*       - Produto
*     summary: Pesquisa todos os produtos.    
*     description: Retorna todos os produtos cadastrados no banco
*     responses:
*       200:
*         description: Usuario consultado com sucesso.
*       500:
*         description: Erro ao atualizar usuario.

* /produto/{id_Produto}:
*   get:
*     security:
*       - bearerAuth: []
*     parameters:
*       - name: nif
*         in: header
*         description: Nif do funcionario que está logado
*         required: true
*         type: string 
*       - name: id_Produto
*         in: path
*         description: Nif do funcionario que está logado
*         required: true
*         type: string 
*     tags:
*       - Produto
*     summary: Pesquisa todos os produtos.    
*     description: Retorna todos os produtos cadastrados no banco
*     responses:
*       200:
*         description: Usuario consultado com sucesso.
*       500:
*         description: Erro ao atualizar usuario.


* /produto/estoque:
*   patch:
*     security:
*       - bearerAuth: []
*     parameters:
*       - name: nif
*         in: header
*         description: Nif do funcionario que está logado
*         required: true
*         type: string 
*     tags:
*       - Produto
*     summary: Edita o estoque do produto.     
*     description: define o estoque do produto.
*     consumes:
*       - application/json
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               idProduto:
*                 type: string
*               quantidade:
*                 type: number
*     responses:
*       '201':
*         description: Funcionario cadastrado com sucesso.
*       '400':
*         description: Dados inválidos.
*       '403':
*         description: Sem autorização.  
*       '500':
*         description: Erro no banco de dados.

* /produto/unico/:
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
*       - Produto
*     summary: Pesquisa todos os produtos.    
*     description: Retorna todos os produtos cadastrados no banco
*     responses:
*       200:
*         description: Produtos consultados com sucesso.
*       500:
*         description: Erro ao consultar produtos.

* /produto/trocarBrinde/:
*   patch:
*     security:
*       - bearerAuth: []
*     parameters:
*       - name: nif
*         in: header
*         description: Nif do funcionario que está logado
*         required: true
*         type: string 
*     tags:
*       - Produto
*     summary: Troca o brinde ativo.     
*     description: define o brinde do semestre.
*     consumes:
*       - application/json
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               listaIdProduto:
*                 type: array
*                 items:
*                   type: string



* /produto/editar:
*   patch:
*     security:
*       - bearerAuth: []
*     parameters:
*       - name: nif
*         in: header
*         description: Nif do funcionario que está logado
*         required: true
*         type: string 
*     tags:
*       - Produto
*     summary: Edita  produtos.     
*     description: Edita um  produto.
*     consumes:
*       - multipart/form-data
*     requestBody:
*       required: true
*       content:
*         multipart/form-data:
*           schema:
*             type: object
*             properties:
*               idProduto:
*                 type: string
*               preto:
*                 type: array
*                 items:
*                   type: string
*                   format: binary
*               nome:
*                 type: string
*               descricao:
*                 type: string 
*               quantidadeEstoque:
*                 type: number
*               cor:
*                 type: string
*               tamanho:
*                  type: string
*               linksFotosAntigas:
*                 type: array
*                 items:
*                   type: string
*               desconto: 
*                 type: number
*               valor: 
*                 type: number
*               brinde:
*                 type: boolean
*     responses:
*       '201':
*         description: Funcionario cadastrado com sucesso.
*       '400':
*         description: Dados inválidos.
*       '403':
*         description: Sem autorização.  
*       '500':
*         description: Erro no banco de dados.


*/