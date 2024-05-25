# Usa a imagem base menor e mais segura
FROM node:20-alpine

# Define o diretório de trabalho
WORKDIR /backend

# Copia apenas os arquivos necessários para instalar dependências
COPY package*.json ./

# Instala as dependências antes de copiar o resto dos arquivos
RUN npm install --production

# Copia o restante do código
COPY . .

# Expõe a porta que a aplicação irá usar
EXPOSE 3333

# Cria um usuário não-root e muda para ele
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Comando para iniciar a aplicação
CMD ["npm", "start"]
