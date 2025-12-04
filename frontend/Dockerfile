# frontend/Dockerfile

# Etapa 1: Construcción
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Servidor Producción (Nginx)
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# 👇 AQUÍ ESTÁ LA MAGIA: Configuración avanzada de Nginx
RUN echo 'server { \
    listen 80; \
    \
    # 1. Rutas del Frontend (React) \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # 2. Rutas del Backend (API) - Reverse Proxy \
    location /api/ { \
        proxy_pass http://api:5000; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_cache_bypass $http_upgrade; \
    } \
    \
    # 3. Soporte para Socket.IO (Realtime) \
    location /socket.io/ { \
        proxy_pass http://api:5000; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]