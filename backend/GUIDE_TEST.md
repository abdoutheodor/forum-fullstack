# Guide de Test - Forum Backend

## 🚀 Démarrage rapide

### 1. Vérifier que tout est installé
```bash
cd backend
npm install
```

### 2. Créer le fichier .env
Copiez `.env.example` et renommez-le en `.env`, puis modifiez les valeurs :
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=forum_db
DB_USER=root
DB_PASSWORD=votre_mot_de_passe_mysql

JWT_SECRET=mon_secret_super_securise_123456
JWT_EXPIRES_IN=7d
```

### 3. Créer la base de données
```bash
# Option 1 : Via ligne de commande MySQL
mysql -u root -p
CREATE DATABASE forum_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;

# Importer le schéma
mysql -u root -p forum_db < src/database/schema.sql

# Option 2 : Via phpMyAdmin (XAMPP/WAMP)
# - Ouvrir phpMyAdmin (http://localhost/phpmyadmin)
# - Créer une nouvelle base de données "forum_db"
# - Importer le fichier src/database/schema.sql
```

### 4. Lancer le serveur
```bash
npm run dev
```

Vous devriez voir :
```
Server is running on port 5000
Environment: development
MySQL Database connected successfully
```

---

## 🧪 Tester avec Postman / Thunder Client / Insomnia

### Étape 1 : Tester la connexion

**GET** `http://localhost:5000/`

Réponse attendue :
```json
{
  "message": "Forum API - Backend is running",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "posts": "/api/posts",
    "comments": "/api",
    "likes": "/api",
    "admin": "/api/admin",
    "search": "/api/search"
  }
}
```

---

### Étape 2 : Créer un utilisateur

**POST** `http://localhost:5000/api/auth/register`

Headers :
```
Content-Type: application/json
```

Body (JSON) :
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

Réponse attendue :
```json
{
  "success": true,
  "message": "Inscription réussie",
  "data": {
    "userId": 1,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**⚠️ IMPORTANT : Copiez le token, vous en aurez besoin pour les requêtes suivantes !**

---

### Étape 3 : Se connecter

**POST** `http://localhost:5000/api/auth/login`

Body (JSON) :
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Réponse :
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "avatar": null,
      "bio": null,
      "is_admin": false
    }
  }
}
```

---

### Étape 4 : Créer un post (Authentification requise)

**POST** `http://localhost:5000/api/posts`

Headers :
```
Content-Type: application/json
Authorization: Bearer VOTRE_TOKEN_ICI
```

Body (JSON) :
```json
{
  "title": "Mon premier post sur le forum",
  "content": "Ceci est le contenu de mon premier post. Je suis très content de tester cette API !"
}
```

Réponse :
```json
{
  "success": true,
  "message": "Post créé avec succès",
  "data": {
    "postId": 1
  }
}
```

---

### Étape 5 : Récupérer tous les posts

**GET** `http://localhost:5000/api/posts`

Pas besoin d'authentification pour cette requête.

Réponse :
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "username": "john_doe",
      "avatar": null,
      "title": "Mon premier post sur le forum",
      "content": "Ceci est le contenu de mon premier post...",
      "likes_count": 0,
      "created_at": "2024-03-06T12:45:00.000Z",
      "updated_at": "2024-03-06T12:45:00.000Z"
    }
  ]
}
```

---

### Étape 6 : Ajouter un commentaire

**POST** `http://localhost:5000/api/posts/1/comments`

Headers :
```
Content-Type: application/json
Authorization: Bearer VOTRE_TOKEN_ICI
```

Body (JSON) :
```json
{
  "content": "Super post ! Merci pour le partage.",
  "parent_comment_id": null
}
```

---

### Étape 7 : Liker un post

**POST** `http://localhost:5000/api/posts/1/like`

Headers :
```
Authorization: Bearer VOTRE_TOKEN_ICI
```

Réponse :
```json
{
  "success": true,
  "message": "Post liké",
  "data": {
    "liked": true
  }
}
```

---

### Étape 8 : Rechercher des posts

**GET** `http://localhost:5000/api/search?q=forum`

Réponse :
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "john_doe",
      "title": "Mon premier post sur le forum",
      "content": "...",
      "likes_count": 1,
      "created_at": "2024-03-06T12:45:00.000Z"
    }
  ]
}
```

---

## 🧪 Tester avec cURL (Terminal)

### Inscription
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"jane_doe\",\"email\":\"jane@example.com\",\"password\":\"password123\"}"
```

### Connexion
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"jane@example.com\",\"password\":\"password123\"}"
```

### Créer un post (remplacez YOUR_TOKEN)
```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d "{\"title\":\"Test post\",\"content\":\"Contenu du test\"}"
```

### Récupérer les posts
```bash
curl http://localhost:5000/api/posts
```

---

## 🔍 Vérifier la base de données

### Via MySQL CLI
```bash
mysql -u root -p forum_db

# Voir les utilisateurs
SELECT * FROM users;

# Voir les posts
SELECT * FROM posts;

# Voir les commentaires
SELECT * FROM comments;

# Voir les likes
SELECT * FROM likes;
```

### Via phpMyAdmin
1. Ouvrir `http://localhost/phpmyadmin`
2. Sélectionner la base `forum_db`
3. Parcourir les tables : users, posts, comments, likes, reports

---

## 📝 Scénario de test complet

1. ✅ Créer 2 utilisateurs (john et jane)
2. ✅ Se connecter avec john
3. ✅ Créer 3 posts avec john
4. ✅ Se connecter avec jane
5. ✅ Liker les posts de john
6. ✅ Commenter les posts de john
7. ✅ Répondre à un commentaire
8. ✅ Rechercher des posts par mot-clé
9. ✅ Modifier un post
10. ✅ Supprimer un commentaire

---

## ❌ Résolution des problèmes courants

### Erreur : "Cannot find module 'express'"
```bash
npm install
```

### Erreur : "Error connecting to MySQL database"
- Vérifiez que MySQL est démarré
- Vérifiez les identifiants dans le fichier `.env`
- Vérifiez que la base de données `forum_db` existe

### Erreur : "Token invalide"
- Le token a peut-être expiré (7 jours par défaut)
- Reconnectez-vous pour obtenir un nouveau token

### Erreur : "Port 5000 already in use"
- Changez le port dans `.env` : `PORT=3000`
- Ou arrêtez le processus qui utilise le port 5000

---

## 🎯 Tests recommandés

### Tests de validation
- ✅ Essayer de s'inscrire avec un email invalide
- ✅ Essayer de créer un post sans token
- ✅ Essayer de créer un post avec un titre trop court
- ✅ Essayer de liker deux fois le même post

### Tests de sécurité
- ✅ Essayer de modifier le post d'un autre utilisateur
- ✅ Essayer d'accéder aux routes admin sans être admin
- ✅ Essayer de se bannir soi-même (admin)

### Tests de performance
- ✅ Créer 100 posts et vérifier la pagination
- ✅ Tester la recherche avec différents mots-clés
