# Forum de Discussion - Backend

Backend API pour le forum de discussion développé avec Node.js, Express et TypeScript.

## Auteurs
- Abdelmoughite SEDRY
- Aymène NAOURA

## Stack Technique
- **Runtime**: Node.js
- **Framework**: Express.js
- **Langage**: TypeScript
- **Base de données**: MySQL
- **Authentification**: JWT (JSON Web Tokens)
- **Sécurité**: bcrypt pour le hachage des mots de passe

## Structure du Projet
```
backend/
├── src/
│   ├── config/          # Configuration (database, etc.)
│   ├── controllers/     # Logique métier
│   ├── routes/          # Routes API
│   ├── models/          # Modèles de données
│   ├── middleware/      # Middleware (auth, error handling)
│   ├── types/           # Types TypeScript
│   ├── database/        # Scripts SQL
│   └── server.ts        # Point d'entrée
├── dist/                # Code compilé
└── node_modules/        # Dépendances
```

## Installation

1. Installer les dépendances:
```bash
cd backend
npm install
```

2. Configurer les variables d'environnement:
```bash
cp .env.example .env
```

3. Modifier le fichier `.env` avec vos informations:
```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=forum_db
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
JWT_SECRET=votre_secret_jwt
```

4. Créer la base de données MySQL:
```bash
mysql -u root -p
CREATE DATABASE forum_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

5. Exécuter le script SQL pour créer les tables:
```bash
mysql -u root -p forum_db < src/database/schema.sql
```

## Démarrage

### Mode développement
```bash
npm run dev
```

### Mode production
```bash
npm run build
npm start
```

## API Endpoints (à venir)

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/profile` - Profil utilisateur

### Posts
- `GET /api/posts` - Liste des posts
- `GET /api/posts/:id` - Détails d'un post
- `POST /api/posts` - Créer un post
- `PUT /api/posts/:id` - Modifier un post
- `DELETE /api/posts/:id` - Supprimer un post
- `POST /api/posts/:id/like` - Liker un post

### Commentaires
- `GET /api/posts/:id/comments` - Commentaires d'un post
- `POST /api/posts/:id/comments` - Ajouter un commentaire
- `DELETE /api/comments/:id` - Supprimer un commentaire

### Admin
- `GET /api/admin/users` - Liste des utilisateurs
- `POST /api/admin/users/:id/ban` - Bannir un utilisateur
- `GET /api/admin/reports` - Liste des signalements

### Recherche
- `GET /api/search?q=keyword` - Rechercher des posts
- `GET /api/search?author=username` - Posts par auteur
- `GET /api/search?date=YYYY-MM-DD` - Posts par date

## Fonctionnalités

- ✅ Gestion des utilisateurs (inscription, connexion, profil)
- ✅ Gestion des posts (CRUD)
- ✅ Système de commentaires (avec réponses)
- ✅ Système de likes
- ✅ Panneau admin (ban, signalements)
- ✅ Recherche avancée (mot-clés, auteur, date)

## Base de Données

### Tables
- `users` - Utilisateurs
- `posts` - Publications
- `comments` - Commentaires
- `likes` - Likes sur les posts
- `reports` - Signalements d'utilisateurs
