# Dockerfile pour le backend Node.js + Express + TypeScript

# Étape 1 : Image de base Node.js
FROM node:18-alpine AS base

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Étape 2 : Build de l'application TypeScript
FROM node:18-alpine AS build

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer toutes les dépendances (dev incluses pour la compilation)
RUN npm ci

# Copier le code source
COPY . .

# Compiler TypeScript en JavaScript
RUN npm run build

# Étape 3 : Image de production
FROM node:18-alpine AS production

WORKDIR /app

# Copier les dépendances de production depuis l'étape base
COPY --from=base /app/node_modules ./node_modules

# Copier le code compilé depuis l'étape build
COPY --from=build /app/dist ./dist

# Copier le package.json pour les métadonnées
COPY package*.json ./

# Exposer le port du serveur
EXPOSE 5000

# Variables d'environnement par défaut (peuvent être surchargées)
ENV NODE_ENV=production
ENV PORT=5000

# Démarrer l'application
CMD ["node", "dist/server.js"]
