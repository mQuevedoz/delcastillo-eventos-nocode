# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiamos archivos de dependencias
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Exponemos el puerto que usa tu index.js
EXPOSE 5000

# Comando de inicio
CMD ["npm", "start"]