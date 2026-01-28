# 1. Escolhe a imagem base (Ex: Node.js)
FROM node:18-alpine

# 2. Cria a pasta de trabalho dentro do container
WORKDIR /app

# 3. Copia os arquivos de dependências
COPY package*.json ./

# 4. Instala as dependências
RUN npm install

# 5. Copia o resto do código
COPY . .

# 6. Expõe a porta que o serviço vai usar
EXPOSE 3001

# 7. Comando para ligar o servidor
CMD ["npm", "start"]