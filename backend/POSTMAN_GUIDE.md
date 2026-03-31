# 🚀 Guide Postman - Forum API

## Étape 1 : Configuration initiale

### Avant de commencer, assurez-vous que :
- ✅ Le fichier `.env` est créé et configuré
- ✅ La base de données MySQL `forum_db` est créée
- ✅ Le serveur est démarré avec `npm run dev`

---

## Étape 2 : Premier test - Vérifier que le serveur fonctionne

### Dans Postman :

1. **Créer une nouvelle requête**
   - Cliquez sur "New" → "HTTP Request"

2. **Configurer la requête**
   - Méthode : `GET`
   - URL : `http://localhost:5000/`

3. **Envoyer**
   - Cliquez sur "Send"

4. **Résultat attendu** (Status: 200 OK)
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

✅ **Si vous voyez cette réponse, votre serveur fonctionne !**

---

## Étape 3 : Créer un utilisateur

### Nouvelle requête dans Postman :

1. **Méthode** : `POST`
2. **URL** : `http://localhost:5000/api/auth/register`
3. **Headers** :
   - Cliquez sur l'onglet "Headers"
   - Ajoutez : `Content-Type` = `application/json`

4. **Body** :
   - Cliquez sur l'onglet "Body"
   - Sélectionnez "raw"
   - Sélectionnez "JSON" dans le menu déroulant
   - Copiez ce JSON :
   ```json
   {
     "username": "john_doe",
     "email": "john@example.com",
     "password": "password123"
   }
   ```

5. **Send**

6. **Résultat attendu** (Status: 201 Created)
```json
{
  "success": true,
  "message": "Inscription réussie",
  "data": {
    "userId": 1,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTcwOTcyNjQwMCwiZXhwIjoxNzEwMzMxMjAwfQ.abc123..."
  }
}
```

⚠️ **IMPORTANT : Copiez le token ! Vous en aurez besoin pour les prochaines requêtes.**

---

## Étape 4 : Se connecter

### Nouvelle requête :

1. **Méthode** : `POST`
2. **URL** : `http://localhost:5000/api/auth/login`
3. **Headers** : `Content-Type` = `application/json`
4. **Body (JSON)** :
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

5. **Résultat attendu** (Status: 200 OK)
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

## Étape 5 : Créer un post (avec authentification)

### Nouvelle requête :

1. **Méthode** : `POST`
2. **URL** : `http://localhost:5000/api/posts`
3. **Headers** :
   - `Content-Type` = `application/json`
   - `Authorization` = `Bearer VOTRE_TOKEN_ICI`
     *(Remplacez VOTRE_TOKEN_ICI par le token que vous avez copié)*

4. **Body (JSON)** :
```json
{
  "title": "Mon premier post",
  "content": "Ceci est le contenu de mon premier post sur le forum !"
}
```

5. **Résultat attendu** (Status: 201 Created)
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

## Étape 6 : Récupérer tous les posts

### Nouvelle requête :

1. **Méthode** : `GET`
2. **URL** : `http://localhost:5000/api/posts`
3. **Pas besoin de headers ni de body**

4. **Résultat attendu** (Status: 200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "username": "john_doe",
      "avatar": null,
      "title": "Mon premier post",
      "content": "Ceci est le contenu de mon premier post sur le forum !",
      "likes_count": 0,
      "created_at": "2024-03-06T12:55:00.000Z",
      "updated_at": "2024-03-06T12:55:00.000Z"
    }
  ]
}
```

---

## Étape 7 : Liker un post

### Nouvelle requête :

1. **Méthode** : `POST`
2. **URL** : `http://localhost:5000/api/posts/1/like`
3. **Headers** :
   - `Authorization` = `Bearer VOTRE_TOKEN_ICI`

4. **Résultat attendu** (Status: 200 OK)
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

## Étape 8 : Ajouter un commentaire

### Nouvelle requête :

1. **Méthode** : `POST`
2. **URL** : `http://localhost:5000/api/posts/1/comments`
3. **Headers** :
   - `Content-Type` = `application/json`
   - `Authorization` = `Bearer VOTRE_TOKEN_ICI`

4. **Body (JSON)** :
```json
{
  "content": "Super post ! Merci pour le partage.",
  "parent_comment_id": null
}
```

---

## 💡 Astuces Postman

### 1. Créer une Collection
- Cliquez sur "Collections" → "Create Collection"
- Nommez-la "Forum API"
- Glissez-déposez vos requêtes dedans pour les organiser

### 2. Utiliser des Variables d'environnement
- Cliquez sur "Environments" → "Create Environment"
- Nom : "Forum Dev"
- Variables :
  - `baseUrl` = `http://localhost:5000`
  - `token` = `votre_token_ici`
- Utilisez `{{baseUrl}}/api/posts` au lieu de l'URL complète
- Utilisez `Bearer {{token}}` dans Authorization

### 3. Sauvegarder vos requêtes
- Après chaque requête, cliquez sur "Save"
- Donnez un nom descriptif : "1. Inscription", "2. Connexion", etc.

### 4. Tests automatiques
Dans l'onglet "Tests" de chaque requête, vous pouvez ajouter :
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has token", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.token).to.exist;
});
```

---

## 📋 Checklist de test

- [ ] Serveur accessible (GET /)
- [ ] Inscription utilisateur
- [ ] Connexion utilisateur
- [ ] Récupérer profil
- [ ] Créer un post
- [ ] Lire tous les posts
- [ ] Lire un post spécifique
- [ ] Modifier un post
- [ ] Liker un post
- [ ] Ajouter un commentaire
- [ ] Rechercher des posts
- [ ] Supprimer un commentaire
- [ ] Supprimer un post

---

## ❌ Erreurs courantes

### "Error: connect ECONNREFUSED"
→ Le serveur n'est pas démarré. Lancez `npm run dev`

### "401 Unauthorized"
→ Token manquant ou invalide. Vérifiez le header Authorization

### "400 Bad Request"
→ Données invalides. Vérifiez le format JSON et les champs requis

### "404 Not Found"
→ URL incorrecte. Vérifiez l'endpoint

### "500 Internal Server Error"
→ Erreur serveur. Vérifiez les logs du serveur dans le terminal

---

## 🎯 Scénario de test complet

1. ✅ Inscription de 2 utilisateurs (john et jane)
2. ✅ Connexion avec john
3. ✅ Créer 3 posts avec john
4. ✅ Connexion avec jane
5. ✅ Jane like les posts de john
6. ✅ Jane commente les posts de john
7. ✅ John répond aux commentaires de jane
8. ✅ Rechercher des posts par mot-clé
9. ✅ Modifier un post
10. ✅ Supprimer un commentaire

Bon test ! 🚀
