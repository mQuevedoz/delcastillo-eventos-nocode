# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

#  archivos de dependencias
COPY package*.json ./

# Instalamos dependencias
RUN npm install

#  Resto del código
COPY . .

#  Puerto que usa tu index.js
EXPOSE 5000

# Comando de inicio
CMD ["npm", "start"]