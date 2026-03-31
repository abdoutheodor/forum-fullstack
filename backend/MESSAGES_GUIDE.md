# 💬 Guide Messagerie Privée - Forum API

## 🚀 Configuration

### 1. Créer la table dans la base de données

Exécutez le fichier SQL pour créer la table `messages` :

```bash
mysql -u root -p forum_db < src/database/messages.sql
```

**OU via phpMyAdmin :**
1. Ouvrez phpMyAdmin
2. Sélectionnez la base `forum_db`
3. Onglet "SQL"
4. Copiez le contenu de `src/database/messages.sql`
5. Cliquez sur "Exécuter"

---

## 📋 Endpoints disponibles

### 1. Envoyer un message privé

**POST** `/api/messages`

**Headers :**
- `Content-Type: application/json`
- `Authorization: Bearer VOTRE_TOKEN`

**Body :**
```json
{
  "receiver_id": 2,
  "content": "Salut ! Comment vas-tu ?"
}
```

**Réponse (201) :**
```json
{
  "success": true,
  "message": "Message envoyé avec succès",
  "data": {
    "messageId": 1
  }
}
```

---

### 2. Récupérer une conversation avec un utilisateur

**GET** `/api/messages/conversation/:userId`

**Headers :**
- `Authorization: Bearer VOTRE_TOKEN`

**Query params (optionnel) :**
- `limit` : Nombre de messages à récupérer (défaut: 50)

**Exemple :**
```
GET /api/messages/conversation/2?limit=20
```

**Réponse (200) :**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "sender_id": 1,
      "receiver_id": 2,
      "content": "Salut ! Comment vas-tu ?",
      "is_read": true,
      "created_at": "2024-03-06T14:30:00.000Z",
      "sender_username": "john_doe",
      "receiver_username": "jane_smith"
    },
    {
      "id": 2,
      "sender_id": 2,
      "receiver_id": 1,
      "content": "Très bien merci ! Et toi ?",
      "is_read": false,
      "created_at": "2024-03-06T14:31:00.000Z",
      "sender_username": "jane_smith",
      "receiver_username": "john_doe"
    }
  ]
}
```

**Note :** Les messages non lus de l'autre utilisateur sont automatiquement marqués comme lus.

---

### 3. Récupérer toutes les conversations

**GET** `/api/messages/conversations`

**Headers :**
- `Authorization: Bearer VOTRE_TOKEN`

**Réponse (200) :**
```json
{
  "success": true,
  "data": [
    {
      "user_id": 2,
      "username": "jane_smith",
      "avatar": "https://example.com/avatar.jpg",
      "last_message": "Très bien merci ! Et toi ?",
      "last_message_time": "2024-03-06T14:31:00.000Z",
      "unread_count": 3
    },
    {
      "user_id": 3,
      "username": "bob_martin",
      "avatar": null,
      "last_message": "À bientôt !",
      "last_message_time": "2024-03-06T12:15:00.000Z",
      "unread_count": 0
    }
  ]
}
```

---

### 4. Récupérer le nombre de messages non lus

**GET** `/api/messages/unread-count`

**Headers :**
- `Authorization: Bearer VOTRE_TOKEN`

**Réponse (200) :**
```json
{
  "success": true,
  "data": {
    "unread_count": 5
  }
}
```

---

### 5. Supprimer un message

**DELETE** `/api/messages/:id`

**Headers :**
- `Authorization: Bearer VOTRE_TOKEN`

**Note :** Seul l'expéditeur peut supprimer son message.

**Réponse (200) :**
```json
{
  "success": true,
  "message": "Message supprimé avec succès"
}
```

---

### 6. Supprimer une conversation complète

**DELETE** `/api/messages/conversation/:userId`

**Headers :**
- `Authorization: Bearer VOTRE_TOKEN`

**Réponse (200) :**
```json
{
  "success": true,
  "message": "Conversation supprimée avec succès"
}
```

---

## 🧪 Tests avec Postman

### Scénario complet :

#### 1. Créer deux utilisateurs

**Utilisateur 1 (John) :**
```json
POST /api/auth/register
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```
→ Copiez le token de John

**Utilisateur 2 (Jane) :**
```json
POST /api/auth/register
{
  "username": "jane_smith",
  "email": "jane@example.com",
  "password": "password123"
}
```
→ Copiez le token de Jane

---

#### 2. John envoie un message à Jane

```json
POST /api/messages
Authorization: Bearer TOKEN_DE_JOHN

{
  "receiver_id": 2,
  "content": "Salut Jane ! Comment vas-tu ?"
}
```

---

#### 3. Jane répond à John

```json
POST /api/messages
Authorization: Bearer TOKEN_DE_JANE

{
  "receiver_id": 1,
  "content": "Salut John ! Je vais très bien, merci !"
}
```

---

#### 4. John consulte la conversation

```json
GET /api/messages/conversation/2
Authorization: Bearer TOKEN_DE_JOHN
```

---

#### 5. Jane vérifie ses messages non lus

```json
GET /api/messages/unread-count
Authorization: Bearer TOKEN_DE_JANE
```

---

#### 6. Jane consulte toutes ses conversations

```json
GET /api/messages/conversations
Authorization: Bearer TOKEN_DE_JANE
```

---

## 💡 Fonctionnalités

✅ **Envoi de messages privés** entre utilisateurs  
✅ **Conversations** : Historique complet des échanges  
✅ **Statut de lecture** : Marquer automatiquement comme lu  
✅ **Compteur de non-lus** : Savoir combien de messages non lus  
✅ **Liste des conversations** : Voir toutes les conversations actives  
✅ **Suppression** : Supprimer un message ou une conversation entière  
✅ **Protection** : Impossible de s'envoyer un message à soi-même  

---

## 🔒 Sécurité

- ✅ Authentification JWT requise pour tous les endpoints
- ✅ Seul l'expéditeur peut supprimer ses messages
- ✅ Les utilisateurs ne peuvent voir que leurs propres conversations
- ✅ Validation des données d'entrée

---

## 📊 Structure de la base de données

```sql
messages
├── id (INT, PRIMARY KEY, AUTO_INCREMENT)
├── sender_id (INT, FOREIGN KEY → users.id)
├── receiver_id (INT, FOREIGN KEY → users.id)
├── content (TEXT)
├── is_read (BOOLEAN, DEFAULT FALSE)
└── created_at (TIMESTAMP)
```

**Index :**
- `idx_messages_sender` sur `sender_id`
- `idx_messages_receiver` sur `receiver_id`
- `idx_messages_created_at` sur `created_at DESC`

---

## 🎯 Cas d'usage

### Interface de messagerie type Facebook/WhatsApp

1. **Liste des conversations** : Afficher toutes les conversations avec badge de non-lus
2. **Ouvrir une conversation** : Charger l'historique complet
3. **Envoyer un message** : Ajouter un nouveau message
4. **Notifications** : Utiliser le compteur de non-lus pour afficher une notification
5. **Marquer comme lu** : Automatique lors de l'ouverture de la conversation

---

## 🚀 Prochaines améliorations possibles

- 🔔 Notifications en temps réel (WebSocket)
- 📎 Support des fichiers/images
- 👥 Messages de groupe
- ✏️ Modification de messages
- 🗑️ Suppression pour les deux parties
- 📌 Messages épinglés
- 🔍 Recherche dans les messages

---

Bon développement ! 💬
