# 🐳 Guide Docker - Application Forum

Ce guide explique comment déployer l'application Forum complète (Frontend + Backend + MySQL) avec Docker.

---

## 📋 Prérequis

- **Docker** installé (version 20.10+)
- **Docker Compose** installé (version 2.0+)

Vérifiez les installations :
```bash
docker --version
docker-compose --version
```

---

## 🚀 Démarrage rapide

### 1. Configuration des variables d'environnement

Copiez le fichier d'exemple et modifiez les valeurs :

```bash
cp .env.docker .env
```

Éditez `.env` et changez au minimum :
- `JWT_SECRET` : Clé secrète pour les tokens JWT (minimum 32 caractères)
- `DB_ROOT_PASSWORD` : Mot de passe root MySQL
- `DB_PASSWORD` : Mot de passe de l'utilisateur MySQL

### 2. Lancer tous les services

```bash
docker-compose up -d
```

Cette commande va :
- ✅ Créer la base de données MySQL
- ✅ Initialiser les tables avec les scripts SQL
- ✅ Builder et démarrer le backend Node.js
- ✅ Builder et démarrer le frontend React

### 3. Vérifier que tout fonctionne

```bash
docker-compose ps
```

Vous devriez voir 3 services en cours d'exécution :
- `forum-mysql` (port 3306)
- `forum-backend` (port 5000)
- `forum-frontend` (port 3000)

### 4. Accéder à l'application

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:5000/api
- **MySQL** : localhost:3306

---

## 📦 Commandes Docker utiles

### Voir les logs

```bash
# Tous les services
docker-compose logs -f

# Backend uniquement
docker-compose logs -f backend

# Frontend uniquement
docker-compose logs -f frontend

# MySQL uniquement
docker-compose logs -f mysql
```

### Arrêter les services

```bash
# Arrêter sans supprimer les conteneurs
docker-compose stop

# Arrêter et supprimer les conteneurs
docker-compose down

# Arrêter et supprimer les conteneurs + volumes (⚠️ supprime la BDD)
docker-compose down -v
```

### Redémarrer un service

```bash
# Redémarrer le backend
docker-compose restart backend

# Redémarrer le frontend
docker-compose restart frontend
```

### Reconstruire les images

```bash
# Reconstruire tous les services
docker-compose build

# Reconstruire et redémarrer
docker-compose up -d --build

# Reconstruire un service spécifique
docker-compose build backend
```

### Accéder à un conteneur

```bash
# Shell dans le backend
docker-compose exec backend sh

# Shell dans MySQL
docker-compose exec mysql bash

# Accéder à MySQL CLI
docker-compose exec mysql mysql -u forum_user -p forum_db
```

---

## 🗄️ Gestion de la base de données

### Initialisation automatique

Les scripts SQL dans `backend/src/database/` sont automatiquement exécutés au premier démarrage de MySQL :
- `schema.sql` : Création des tables
- `friendships.sql` : Tables d'amitié
- `messages.sql` : Tables de messagerie

### Sauvegarder la base de données

```bash
docker-compose exec mysql mysqldump -u root -p forum_db > backup.sql
```

### Restaurer une sauvegarde

```bash
docker-compose exec -T mysql mysql -u root -p forum_db < backup.sql
```

### Réinitialiser la base de données

```bash
# Supprimer le volume MySQL
docker-compose down -v

# Redémarrer (les scripts SQL seront réexécutés)
docker-compose up -d
```

---

## 🔧 Configuration avancée

### Changer les ports

Éditez `.env` :
```env
BACKEND_PORT=8080
FRONTEND_PORT=8000
DB_PORT=3307
```

### Mode développement avec hot-reload

Pour le backend, modifiez `docker-compose.yml` :
```yaml
backend:
  command: npm run dev
  volumes:
    - ./backend/src:/app/src
```

Pour le frontend, utilisez le serveur de développement Vite au lieu de Nginx :
```yaml
frontend:
  command: npm run dev -- --host
  ports:
    - "3000:3000"
```

### Variables d'environnement personnalisées

Ajoutez vos variables dans `.env` et référencez-les dans `docker-compose.yml` :
```yaml
environment:
  CUSTOM_VAR: ${CUSTOM_VAR}
```

---

## 🐛 Dépannage

### Le backend ne se connecte pas à MySQL

**Problème** : `Error: connect ECONNREFUSED`

**Solution** : Attendez que MySQL soit complètement démarré
```bash
docker-compose logs mysql
# Attendez le message "ready for connections"
docker-compose restart backend
```

### Le frontend ne peut pas appeler l'API

**Problème** : Erreur CORS ou connexion refusée

**Solution** : Vérifiez que `VITE_API_URL` dans `.env` pointe vers le bon port
```env
VITE_API_URL=http://localhost:5000/api
```

Puis reconstruisez le frontend :
```bash
docker-compose build frontend
docker-compose up -d frontend
```

### Erreur "port already in use"

**Problème** : Un service utilise déjà le port

**Solution** : Changez le port dans `.env` ou arrêtez le service conflictuel
```bash
# Voir quel processus utilise le port 5000
netstat -ano | findstr :5000

# Changer le port dans .env
BACKEND_PORT=5001
```

### Les modifications de code ne sont pas prises en compte

**Solution** : Reconstruisez l'image Docker
```bash
docker-compose build backend
docker-compose up -d backend
```

---

## 📊 Monitoring

### Voir l'utilisation des ressources

```bash
docker stats
```

### Inspecter un conteneur

```bash
docker inspect forum-backend
```

### Voir les réseaux

```bash
docker network ls
docker network inspect backend-front_forum-network
```

---

## 🚢 Déploiement en production

### 1. Sécuriser les variables d'environnement

- Générez un `JWT_SECRET` fort (32+ caractères aléatoires)
- Utilisez des mots de passe complexes pour MySQL
- Ne commitez JAMAIS le fichier `.env`

### 2. Utiliser HTTPS

Ajoutez un reverse proxy (Nginx, Traefik, Caddy) devant les services.

### 3. Limiter les ressources

Ajoutez des limites dans `docker-compose.yml` :
```yaml
backend:
  deploy:
    resources:
      limits:
        cpus: '1'
        memory: 512M
```

### 4. Sauvegardes automatiques

Configurez un cron job pour sauvegarder MySQL régulièrement.

---

## 📚 Structure des fichiers Docker

```
Backend-front/
├── docker-compose.yml          # Orchestration de tous les services
├── .env                        # Variables d'environnement (à créer)
├── .env.docker                 # Template des variables
├── .dockerignore               # Fichiers à ignorer
├── backend/
│   ├── Dockerfile              # Image Docker du backend
│   └── .dockerignore
└── frontend/
    ├── Dockerfile              # Image Docker du frontend
    ├── nginx.conf              # Configuration Nginx
    └── .dockerignore
```

---

## ✅ Checklist de déploiement

- [ ] Copier `.env.docker` vers `.env`
- [ ] Modifier `JWT_SECRET` avec une valeur sécurisée
- [ ] Modifier les mots de passe MySQL
- [ ] Vérifier que les ports ne sont pas utilisés
- [ ] Lancer `docker-compose up -d`
- [ ] Vérifier les logs : `docker-compose logs -f`
- [ ] Tester l'accès au frontend : http://localhost:3000
- [ ] Tester l'accès à l'API : http://localhost:5000/api

---

## 🆘 Support

En cas de problème :
1. Vérifiez les logs : `docker-compose logs -f`
2. Vérifiez l'état des services : `docker-compose ps`
3. Consultez la documentation Docker officielle

---

**Votre application Forum est maintenant dockerisée ! 🎉**
