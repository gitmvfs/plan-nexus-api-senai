/** 

* @swagger
* tags:
*   - name: Reserva
*     description: Operações relacionadas a funcionários do sistema

* definitions:
*   cancelarReserva:
*     type: object
*     properties:
*       id_reserva:
*         type: string


*   confirmarReserva:
*     type: object
*     properties:
*       id_reserva:
*         type: string


* /reserva/todas:
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
*       - Reserva
*     summary: Pesquisa por todas as reservas.    
*     description: Retorna as reservas do banco de dados
*     responses:
*       200:
*         description: Consulta realizada com sucesso.
*       404:
*         description: Funcionario não encontrado .

* /reserva/{id_reserva}:
*   get:
*     security:
*       - bearerAuth: []
*     parameters:
*       - name: nif
*         in: header
*         description: Nif do funcionario que está logado
*         required: true
*         type: string
*       - name: id_reserva
*         in: path   
*         description: id da reserva a ser encontrada
*         required: true
*         type: string 
*     tags:
*       - Reserva
*     summary: Pesquisa por uma reserva específica.    
*     description: Retorna uma reserva com base no id
*     responses:
*       200:
*         description: reserva encontrada
*       404:
*         description: reserva não encontrada .

* /reserva/cancelar:
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
*             $ref: '#/definitions/cancelarReserva'  
*     tags:
*       - Reserva
*     summary: cancelar uma reserva.    
*     description: atualiza o status de uma reserva para cancelada com base no id
*     responses:
*       200:
*         description: reserva cancelada com sucesso
*       400:
*         description: não é possível cancelar a reserva .
*       404:
*         description: reserva não encontrada .

* /reserva/confirmar:
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
*             $ref: '#/definitions/confirmarReserva'  
*     tags:
*       - Reserva
*     summary: confirmar uma reserva.    
*     description: atualiza o status de uma reserva para entregue
*     responses:
*       200:
*         description: reserva entregue
*       400:
*         description: não é possível confirmar a reserva .
*       404:
*         description: reserva não encontrada .



*/