# Documentation API - Forum de Discussion

## Base URL
```
http://localhost:5000/api
```

## Authentification
L'API utilise JWT (JSON Web Tokens) pour l'authentification. Incluez le token dans l'en-tête Authorization :
```
Authorization: Bearer <token>
```

---

## Endpoints

### 🔐 Authentification (`/api/auth`)

#### POST /api/auth/register
Inscription d'un nouvel utilisateur.

**Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Réponse (201):**
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

#### POST /api/auth/login
Connexion d'un utilisateur.

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Réponse (200):**
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

#### GET /api/auth/profile
Récupérer le profil de l'utilisateur connecté. **[Authentification requise]**

**Réponse (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "Développeur passionné",
    "is_admin": false,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

#### PUT /api/auth/profile
Mettre à jour le profil. **[Authentification requise]**

**Body:**
```json
{
  "avatar": "https://example.com/new-avatar.jpg",
  "bio": "Nouvelle bio"
}
```

---

### 📝 Posts (`/api/posts`)

#### POST /api/posts
Créer un nouveau post. **[Authentification requise]**

**Body:**
```json
{
  "title": "Mon premier post",
  "content": "Contenu du post..."
}
```

**Réponse (201):**
```json
{
  "success": true,
  "message": "Post créé avec succès",
  "data": {
    "postId": 1
  }
}
```

#### GET /api/posts
Récupérer tous les posts.

**Query params:**
- `limit` (optionnel, défaut: 20)
- `offset` (optionnel, défaut: 0)

**Réponse (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "username": "john_doe",
      "avatar": "https://example.com/avatar.jpg",
      "title": "Mon premier post",
      "content": "Contenu du post...",
      "likes_count": 5,
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

#### GET /api/posts/:id
Récupérer un post par son ID.

**Réponse (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "username": "john_doe",
    "avatar": "https://example.com/avatar.jpg",
    "title": "Mon premier post",
    "content": "Contenu du post...",
    "likes_count": 5,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

#### GET /api/posts/user/:userId
Récupérer tous les posts d'un utilisateur.

**Query params:**
- `limit` (optionnel, défaut: 20)
- `offset` (optionnel, défaut: 0)

#### PUT /api/posts/:id
Modifier un post. **[Authentification requise]**

**Body:**
```json
{
  "title": "Titre modifié",
  "content": "Contenu modifié..."
}
```

#### DELETE /api/posts/:id
Supprimer un post. **[Authentification requise]**

---

### 💬 Commentaires (`/api`)

#### POST /api/posts/:postId/comments
Ajouter un commentaire à un post. **[Authentification requise]**

**Body:**
```json
{
  "content": "Super post !",
  "parent_comment_id": null
}
```

**Réponse (201):**
```json
{
  "success": true,
  "message": "Commentaire créé avec succès",
  "data": {
    "commentId": 1
  }
}
```

#### GET /api/posts/:postId/comments
Récupérer tous les commentaires d'un post.

**Réponse (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "post_id": 1,
      "user_id": 2,
      "username": "jane_doe",
      "avatar": "https://example.com/avatar2.jpg",
      "parent_comment_id": null,
      "content": "Super post !",
      "created_at": "2024-01-15T11:00:00.000Z",
      "updated_at": "2024-01-15T11:00:00.000Z"
    }
  ]
}
```

#### GET /api/comments/:commentId/replies
Récupérer les réponses à un commentaire.

#### DELETE /api/comments/:id
Supprimer un commentaire. **[Authentification requise]**

---

### ❤️ Likes (`/api`)

#### POST /api/posts/:postId/like
Liker/Unliker un post (toggle). **[Authentification requise]**

**Réponse (200):**
```json
{
  "success": true,
  "message": "Post liké",
  "data": {
    "liked": true
  }
}
```

#### GET /api/posts/:postId/likes
Récupérer le nombre de likes et si l'utilisateur a liké. **[Authentification requise]**

**Réponse (200):**
```json
{
  "success": true,
  "data": {
    "count": 5,
    "userLiked": true
  }
}
```

---

### 🔍 Recherche (`/api/search`)

#### GET /api/search
Rechercher des posts.

**Query params (au moins un requis):**
- `q` : Recherche par mot-clé (titre ou contenu)
- `author` : Recherche par nom d'auteur
- `date` : Recherche par date (format: YYYY-MM-DD)
- `limit` (optionnel, défaut: 20)

**Exemples:**
```
GET /api/search?q=javascript
GET /api/search?author=john
GET /api/search?date=2024-01-15
```

**Réponse (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "username": "john_doe",
      "avatar": "https://example.com/avatar.jpg",
      "title": "Introduction à JavaScript",
      "content": "JavaScript est un langage...",
      "likes_count": 10,
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### 👑 Administration (`/api/admin`)

**Tous les endpoints admin nécessitent l'authentification ET le rôle admin.**

#### GET /api/admin/users
Récupérer tous les utilisateurs.

**Query params:**
- `limit` (optionnel, défaut: 50)
- `offset` (optionnel, défaut: 0)

#### POST /api/admin/users/:id/ban
Bannir/Débannir un utilisateur.

**Body:**
```json
{
  "is_banned": true
}
```

#### DELETE /api/admin/posts/:id
Supprimer un post (admin).

#### DELETE /api/admin/comments/:id
Supprimer un commentaire (admin).

#### POST /api/admin/reports
Créer un signalement. **[Authentification requise - pas besoin d'être admin]**

**Body:**
```json
{
  "reported_user_id": 5,
  "reason": "Contenu inapproprié"
}
```

#### GET /api/admin/reports
Récupérer tous les signalements.

**Query params:**
- `status` (optionnel): pending, reviewed, resolved
- `limit` (optionnel, défaut: 50)
- `offset` (optionnel, défaut: 0)

**Réponse (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "reporter_id": 2,
      "reporter_username": "jane_doe",
      "reported_user_id": 5,
      "reported_username": "bad_user",
      "reason": "Contenu inapproprié",
      "status": "pending",
      "created_at": "2024-01-15T12:00:00.000Z"
    }
  ]
}
```

#### PUT /api/admin/reports/:id/status
Mettre à jour le statut d'un signalement.

**Body:**
```json
{
  "status": "reviewed"
}
```

---

## Codes d'erreur

- `200` : Succès
- `201` : Créé avec succès
- `400` : Requête invalide
- `401` : Non authentifié
- `403` : Accès interdit
- `404` : Ressource non trouvée
- `500` : Erreur serveur

## Format des erreurs

```json
{
  "success": false,
  "message": "Message d'erreur",
  "errors": [
    {
      "field": "email",
      "message": "Email invalide"
    }
  ]
}
```
