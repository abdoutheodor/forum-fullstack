# Dockerfile pour le frontend React + Vite

# Étape 1 : Build de l'application React
FROM node:18-alpine AS build

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY . .

# Build de l'application pour la production
RUN npm run build

# Étape 2 : Serveur Nginx pour servir l'application
FROM nginx:alpine AS production

# Copier les fichiers buildés dans le répertoire Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copier la configuration Nginx personnalisée pour React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 80
EXPOSE 80

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
