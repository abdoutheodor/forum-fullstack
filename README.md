# 📱 Application Forum - Documentation Complète

## 📋 Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Technologies utilisées](#technologies-utilisées)
4. [Structure du projet](#structure-du-projet)
5. [Base de données](#base-de-données)
6. [API Endpoints](#api-endpoints)
7. [Installation et démarrage](#installation-et-démarrage)
8. [Fonctionnalités](#fonctionnalités)

---

## 🎯 Vue d'ensemble

Application web de forum social avec système d'amis et messagerie privée. Les utilisateurs peuvent créer des posts, interagir avec d'autres utilisateurs, ajouter des amis et échanger des messages privés.

---

## 🏗️ Architecture

### Backend (Node.js + Express + TypeScript)
```
backend/
├── src/
│   ├── config/          # Configuration (base de données)
│   ├── middleware/      # Middlewares (authentification, erreurs)
│   ├── models/          # Modèles de données (User, Post, Message, etc.)
│   ├── controllers/     # Logique métier (authController, postController, etc.)
│   ├── routes/          # Définition des routes API
│   ├── database/        # Scripts SQL de création des tables
│   └── server.ts        # Point d'entrée du serveur
```

### Frontend (React + TypeScript + TailwindCSS)
```
frontend/
├── src/
│   ├── components/      # Composants réutilisables (Navbar, ProtectedRoute)
│   ├── context/         # Contextes React (AuthContext)
│   ├── pages/           # Pages de l'application (Home, Login, Friends, Messages)
│   ├── services/        # Services API (authService, friendService, messageService)
│   └── App.tsx          # Composant principal avec routing
```

---

## 🛠️ Technologies utilisées

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **TypeScript** - Typage statique
- **MySQL** (mysql2) - Base de données relationnelle
- **JWT** (jsonwebtoken) - Authentification par token
- **bcryptjs** - Hachage des mots de passe
- **cors** - Gestion des requêtes cross-origin

### Frontend
- **React 18** - Bibliothèque UI
- **TypeScript** - Typage statique
- **React Router v6** - Gestion du routing
- **Axios** - Client HTTP
- **TailwindCSS** - Framework CSS utilitaire
- **Lucide React** - Icônes
- **React Hot Toast** - Notifications
- **Vite** - Build tool et dev server

---

## 📁 Structure du projet

### Backend - Fichiers principaux

#### `src/middleware/auth.ts`
Middleware d'authentification qui :
- Vérifie la présence et validité du token JWT
- Extrait les informations utilisateur du token
- Ajoute `req.user` pour les contrôleurs suivants
- Vérifie si l'utilisateur est banni

#### `src/controllers/friendshipController.ts`
Gère toutes les opérations liées aux amitiés :
- Envoi de demandes d'ami
- Acceptation/Rejet de demandes
- Suppression d'amis
- Liste des amis et demandes

#### `src/models/Friendship.ts`
Modèle de données pour les amitiés :
- Méthodes pour créer/modifier les relations
- Requêtes SQL pour gérer les statuts (pending, accepted, rejected)

### Frontend - Fichiers principaux

#### `src/context/AuthContext.tsx`
Contexte React global pour l'authentification :
- Stocke l'état de l'utilisateur connecté
- Fournit les fonctions login, register, logout
- Vérifie l'authentification au chargement de l'app

#### `src/services/friendService.ts`
Service pour les appels API liés aux amis :
- Recherche d'utilisateurs
- Gestion des demandes d'ami
- Récupération des listes d'amis

#### `src/services/messageService.ts`
Service pour la messagerie privée :
- Envoi de messages
- Récupération des conversations
- Gestion des messages non lus

---

## 🗄️ Base de données

### Tables principales

#### `users`
```sql
- id (INT, PRIMARY KEY)
- username (VARCHAR, UNIQUE)
- email (VARCHAR, UNIQUE)
- password (VARCHAR, haché avec bcrypt)
- avatar (VARCHAR, optionnel)
- bio (TEXT, optionnel)
- is_admin (BOOLEAN)
- is_banned (BOOLEAN)
- created_at (TIMESTAMP)
```

#### `friendships`
```sql
- id (INT, PRIMARY KEY)
- requester_id (INT, FK vers users)
- receiver_id (INT, FK vers users)
- status (ENUM: 'pending', 'accepted', 'rejected')
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### `messages`
```sql
- id (INT, PRIMARY KEY)
- sender_id (INT, FK vers users)
- receiver_id (INT, FK vers users)
- content (TEXT)
- is_read (BOOLEAN)
- created_at (TIMESTAMP)
```

#### `posts`
```sql
- id (INT, PRIMARY KEY)
- user_id (INT, FK vers users)
- title (VARCHAR)
- content (TEXT)
- likes_count (INT)
- created_at (TIMESTAMP)
```

---

## 🔌 API Endpoints

### Authentification (`/api/auth`)
- `POST /register` - Inscription
- `POST /login` - Connexion
- `GET /profile` - Profil utilisateur (authentifié)

### Utilisateurs (`/api/users`)
- `GET /search?query=...` - Rechercher des utilisateurs (authentifié)
- `GET /:id` - Obtenir un utilisateur par ID (authentifié)

### Amitiés (`/api/friendships`)
- `POST /request` - Envoyer une demande d'ami
- `POST /accept` - Accepter une demande
- `POST /reject` - Rejeter une demande
- `DELETE /:friendId` - Supprimer un ami
- `GET /list` - Liste des amis
- `GET /pending` - Demandes reçues
- `GET /sent` - Demandes envoyées

### Messages (`/api/messages`)
- `POST /` - Envoyer un message
- `GET /conversations` - Liste des conversations
- `GET /conversation/:userId` - Messages avec un utilisateur
- `GET /unread-count` - Nombre de messages non lus
- `DELETE /:messageId` - Supprimer un message

### Posts (`/api/posts`)
- `GET /` - Liste des posts
- `POST /` - Créer un post
- `GET /:id` - Obtenir un post
- `PUT /:id` - Modifier un post
- `DELETE /:id` - Supprimer un post

---

## 🚀 Installation et démarrage

### Prérequis
- Node.js (v16+)
- MySQL (via UwAmp, XAMPP, ou autre)
- npm ou yarn

### 1. Cloner le projet
```bash
git clone <url-du-repo>
cd Backend-front
```

### 2. Configuration Backend

```bash
cd backend
npm install
```

Créer un fichier `.env` :
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=forum_db
JWT_SECRET=votre_secret_jwt_tres_securise
NODE_ENV=development
```

Créer la base de données :
```sql
CREATE DATABASE forum_db;
```

Exécuter les scripts SQL dans `backend/src/database/` via phpMyAdmin.

Démarrer le serveur :
```bash
npm run dev
```

### 3. Configuration Frontend

```bash
cd frontend
npm install
```

Créer un fichier `.env` :
```env
VITE_API_URL=http://localhost:5000/api
```

Démarrer l'application :
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3001`

---

## ✨ Fonctionnalités

### 🔐 Authentification
- Inscription avec validation
- Connexion sécurisée (JWT)
- Gestion de session persistante
- Déconnexion

### 👥 Système d'amis
- **Recherche d'utilisateurs** par nom ou email
- **Envoi de demandes d'ami**
- **Acceptation/Rejet** des demandes
- **Liste des amis** avec statut
- **Suppression d'amis**

### 💬 Messagerie privée
- **Conversations** avec liste des amis
- **Envoi de messages** en temps réel
- **Bouton "Nouvelle conversation"** pour démarrer un chat
- **Historique des messages**
- Interface intuitive avec panneau gauche/droite

### 📝 Posts et interactions
- **Créer des posts** avec titre et contenu
- **Liker** les posts
- **Commenter** les posts
- **Rechercher** des posts par mots-clés
- **Modifier/Supprimer** ses propres posts

### 👤 Profil utilisateur
- Modifier son profil (bio, avatar)
- Voir le profil des autres utilisateurs

---

## 🔒 Sécurité

- **Mots de passe hachés** avec bcrypt
- **Tokens JWT** pour l'authentification
- **Validation des données** côté backend
- **Protection CORS** configurée
- **Middleware d'authentification** sur les routes protégées
- **Vérification des permissions** (utilisateur banni, admin)

---

## 🎨 Interface utilisateur

- Design moderne avec **TailwindCSS**
- Interface responsive (mobile-friendly)
- Icônes avec **Lucide React**
- Notifications toast avec **React Hot Toast**
- Navigation fluide avec **React Router**

---

## 📊 Flux de données

### Authentification
```
1. Utilisateur → Login Form
2. Frontend → POST /api/auth/login
3. Backend → Vérification email/password
4. Backend → Génération token JWT
5. Backend → Retour token + données utilisateur
6. Frontend → Stockage token (localStorage)
7. Frontend → Ajout token dans headers (Authorization: Bearer TOKEN)
```

### Ajout d'ami
```
1. Utilisateur → Recherche par nom
2. Frontend → GET /api/users/search?query=nom
3. Backend → Retour liste utilisateurs
4. Utilisateur → Clic "Ajouter"
5. Frontend → POST /api/friendships/request
6. Backend → Création demande (status: pending)
7. Destinataire → Notification demande reçue
8. Destinataire → Accepte/Rejette
9. Frontend → POST /api/friendships/accept
10. Backend → Mise à jour status (accepted)
```

### Messagerie
```
1. Utilisateur → Clic "Nouvelle conversation"
2. Frontend → GET /api/friendships/list
3. Backend → Retour liste des amis
4. Utilisateur → Sélection ami
5. Frontend → GET /api/messages/conversation/:userId
6. Backend → Retour historique messages
7. Utilisateur → Envoi message
8. Frontend → POST /api/messages
9. Backend → Sauvegarde message en DB
10. Frontend → Rafraîchissement conversation
```

---

## 🐛 Résolution de problèmes

### MySQL ne démarre pas
- Vérifier que le port 3306 n'est pas utilisé
- Redémarrer UwAmp/XAMPP
- Vérifier les logs MySQL

### Backend ne démarre pas (port 5000 occupé)
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5000
kill -9 <PID>
```

### Erreur 401 (Non autorisé)
- Vérifier que le token JWT est valide
- Vérifier que l'utilisateur n'est pas banni
- Reconnecter l'utilisateur

### Tables manquantes
- Exécuter les scripts SQL dans `backend/src/database/`
- Vérifier que la base de données `forum_db` existe

---

## 📈 Améliorations futures possibles

1. **WebSockets** pour les messages en temps réel
2. **Upload d'images** dans les posts et messages
3. **Notifications push** pour les demandes d'ami et messages
4. **Système de groupes** de discussion
5. **Réactions emoji** sur les messages
6. **Statut en ligne/hors ligne** des utilisateurs
7. **Recherche avancée** avec filtres
8. **Mode sombre**
9. **Pagination** pour les posts et messages
10. **Système de tags** pour les posts

---

## 👨‍💻 Développé par

Projet de forum social avec système d'amis et messagerie privée.

**Technologies** : Node.js, Express, React, TypeScript, MySQL, TailwindCSS

---

## 📝 Licence

Ce projet est à usage éducatif.
