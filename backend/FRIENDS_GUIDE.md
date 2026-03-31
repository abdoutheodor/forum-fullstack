# 👥 Système d'Amis - Guide Complet

## 📋 Fonctionnalités

Le système d'amis permet aux utilisateurs de :
- ✅ Envoyer des demandes d'ami
- ✅ Accepter ou refuser des demandes
- ✅ Voir la liste de leurs amis
- ✅ Supprimer des amis
- ✅ Envoyer des messages privés uniquement aux amis

---

## 🗄️ Base de Données

### Table `friendships`

```sql
CREATE TABLE IF NOT EXISTS friendships (
  id INT AUTO_INCREMENT PRIMARY KEY,
  requester_id INT NOT NULL,
  receiver_id INT NOT NULL,
  status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_friendship (requester_id, receiver_id)
);
```

**Exécutez ce script dans phpMyAdmin pour créer la table.**

---

## 🔌 API Endpoints

### 1. Envoyer une demande d'ami

**POST** `/api/friendships/request`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "receiverId": 2
}
```

**Réponse:**
```json
{
  "message": "Demande d'ami envoyée",
  "requestId": 1
}
```

---

### 2. Accepter une demande

**POST** `/api/friendships/accept`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "requesterId": 1
}
```

**Réponse:**
```json
{
  "message": "Demande d'ami acceptée"
}
```

---

### 3. Refuser une demande

**POST** `/api/friendships/reject`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "requesterId": 1
}
```

**Réponse:**
```json
{
  "message": "Demande d'ami refusée"
}
```

---

### 4. Supprimer un ami

**DELETE** `/api/friendships/:friendId`

**Headers:**
```
Authorization: Bearer <token>
```

**Réponse:**
```json
{
  "message": "Ami supprimé"
}
```

---

### 5. Liste des amis

**GET** `/api/friendships/list`

**Headers:**
```
Authorization: Bearer <token>
```

**Réponse:**
```json
[
  {
    "id": 1,
    "user_id": 2,
    "username": "john_doe",
    "email": "john@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "status": "accepted",
    "created_at": "2024-01-01T10:00:00.000Z"
  }
]
```

---

### 6. Demandes reçues (en attente)

**GET** `/api/friendships/pending`

**Headers:**
```
Authorization: Bearer <token>
```

**Réponse:**
```json
[
  {
    "id": 2,
    "user_id": 3,
    "username": "jane_smith",
    "email": "jane@example.com",
    "avatar": null,
    "status": "pending",
    "created_at": "2024-01-01T11:00:00.000Z"
  }
]
```

---

### 7. Demandes envoyées

**GET** `/api/friendships/sent`

**Headers:**
```
Authorization: Bearer <token>
```

**Réponse:**
```json
[
  {
    "id": 3,
    "user_id": 4,
    "username": "bob_wilson",
    "email": "bob@example.com",
    "avatar": null,
    "status": "pending",
    "created_at": "2024-01-01T12:00:00.000Z"
  }
]
```

---

## 🎯 Scénario de Test

### Étape 1 : Créer deux utilisateurs

**Utilisateur 1:**
- Username: `alice`
- Email: `alice@example.com`
- Password: `password123`
- ID: 1

**Utilisateur 2:**
- Username: `bob`
- Email: `bob@example.com`
- Password: `password123`
- ID: 2

### Étape 2 : Alice envoie une demande à Bob

1. Connectez-vous en tant qu'Alice
2. Allez sur `/friends`
3. Entrez l'ID de Bob (2)
4. Cliquez sur "Envoyer"

### Étape 3 : Bob accepte la demande

1. Déconnectez-vous
2. Connectez-vous en tant que Bob
3. Allez sur `/friends`
4. Cliquez sur l'onglet "Demandes reçues"
5. Cliquez sur le bouton vert (✓) pour accepter

### Étape 4 : Vérifier qu'ils sont amis

1. Cliquez sur l'onglet "Mes amis"
2. Vous devriez voir Alice dans la liste

### Étape 5 : Envoyer un message privé

1. Allez sur `/messages`
2. Vous pouvez maintenant envoyer des messages à Alice

---

## 🔒 Règles de Sécurité

1. **Authentification requise** : Toutes les routes nécessitent un token JWT valide
2. **Pas d'auto-ajout** : Un utilisateur ne peut pas s'ajouter lui-même
3. **Unicité** : Une seule demande peut exister entre deux utilisateurs
4. **Cascade** : Si un utilisateur est supprimé, toutes ses amitiés sont supprimées

---

## 🐛 Erreurs Possibles

### 400 - Bad Request
- ID du destinataire manquant
- Tentative de s'ajouter soi-même
- Une demande existe déjà

### 401 - Unauthorized
- Token manquant ou invalide

### 500 - Internal Server Error
- Erreur de base de données
- Problème serveur

---

## 💡 Améliorations Futures

- [ ] Recherche d'utilisateurs par nom
- [ ] Suggestions d'amis
- [ ] Blocage d'utilisateurs
- [ ] Notifications de demandes d'ami
- [ ] Limite du nombre d'amis

---

**Le système d'amis est maintenant complet et fonctionnel ! 🎉**
