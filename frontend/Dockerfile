FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
# O "--host" é necessário para o Docker conseguir acessar o Vite
CMD ["npm", "run", "dev", "--", "--host"]