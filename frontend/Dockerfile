FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
# Agora rodamos o servidor real que criamos acima
CMD ["npm", "start"]