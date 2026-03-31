# Présentation du Projet — Forum Full-Stack
### ABDEL & AYMEN — M1 SEC — S8

---

---

# SLIDE 1 — Page de titre

## Forum Collaboratif Full-Stack
### Application web de forum avec messagerie et réseau social

| | |
|---|---|
| **Réalisé par** | Abdelmoughite SEDRY & Aymen NAOURA |
| **Formation** | Master 1 Sécurité Informatique — S8 |
| **Technos** | Node.js · React · TypeScript · MySQL |
| **Méthode** | Git Flow / Versionnement collaboratif |

---

---

# SLIDE 2 — Présentation générale du projet

## C'est quoi ?

Un **forum web complet** permettant à des utilisateurs de :
- Publier et commenter des articles
- Liker et interagir avec le contenu
- Envoyer des messages privés
- Gérer un réseau d'amis
- Modérer le contenu (espace admin)

## Pourquoi ce projet ?

> Mettre en pratique une architecture full-stack moderne de bout en bout :
> conception de la base de données → API REST → interface utilisateur.

---

---

# SLIDE 3 — Stack Technique

## Côté Serveur (Backend)

| Technologie | Rôle |
|---|---|
| **Node.js + Express** | Serveur HTTP et routage API |
| **TypeScript** | Typage statique, meilleure maintenabilité |
| **MySQL + mysql2** | Base de données relationnelle, requêtes async/await |
| **JWT (jsonwebtoken)** | Authentification sans session côté serveur |
| **bcrypt** | Hachage sécurisé des mots de passe |
| **express-validator** | Validation et sanitisation des entrées |
| **dotenv** | Gestion des variables d'environnement |

## Côté Client (Frontend)

| Technologie | Rôle |
|---|---|
| **React 18 + Vite** | Interface utilisateur, build ultra-rapide |
| **TypeScript** | Typage bout-en-bout |
| **React Router v6** | Navigation côté client (SPA) |
| **Axios** | Requêtes HTTP avec intercepteurs JWT |
| **TailwindCSS** | Mise en page utility-first, responsive |
| **React Hot Toast** | Notifications non-intrusives |
| **Lucide React** | Bibliothèque d'icônes cohérente |

---

---

# SLIDE 4 — Architecture du Projet

## Schéma d'architecture

```
┌─────────────────────────────────────────────────────┐
│                    NAVIGATEUR                        │
│  ┌──────────────────────────────────────────────┐   │
│  │         FRONTEND — React + Vite              │   │
│  │   Pages  │  Services  │  Context  │  Routes  │   │
│  └────────────────────┬─────────────────────────┘   │
│                       │ HTTP (Axios + JWT)           │
└───────────────────────┼─────────────────────────────┘
                        │
┌───────────────────────┼─────────────────────────────┐
│   BACKEND — Express + TypeScript                     │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐ │
│  │  Routes  │→ │ Middleware│→ │    Controllers     │ │
│  └──────────┘  │  auth    │  │ auth / post /      │ │
│                │  valid.  │  │ comment / friend / │ │
│                │  errors  │  │ message / admin    │ │
│                └──────────┘  └────────┬───────────┘ │
│                                       │             │
│                              ┌────────▼───────────┐ │
│                              │      Models        │ │
│                              │  User/Post/Comment │ │
│                              │  Like/Message/     │ │
│                              │  Friendship/Report │ │
│                              └────────┬───────────┘ │
└───────────────────────────────────────┼─────────────┘
                                        │
┌───────────────────────────────────────┼─────────────┐
│   BASE DE DONNÉES — MySQL             │             │
│   users · posts · comments · likes   │             │
│   messages · friendships · reports   ▼             │
└─────────────────────────────────────────────────────┘
```

## Pattern architectural : MVC

- **Model** — Requêtes SQL, logique métier (dossier `models/`)
- **Controller** — Traitement des requêtes HTTP (dossier `controllers/`)
- **View** — Rendu React côté client (dossier `pages/`)

---

---

# SLIDE 5 — Base de Données

## Schéma relationnel — 7 tables

```
USERS ──────────────────────────────────────────────┐
  id · username · email · password(bcrypt)           │
  avatar · bio · is_admin · is_banned · created_at  │
       │                                             │
       ├──── POSTS ─────────────────────────────────┤
       │       id · user_id(FK) · title · content   │
       │       likes_count · created_at              │
       │          │                                  │
       │          ├── COMMENTS ─────────────────────┤
       │          │     id · post_id(FK)             │
       │          │     user_id(FK)                  │
       │          │     parent_comment_id(FK self)   │  ← réponses imbriquées
       │          │     content · created_at         │
       │          │                                  │
       │          └── LIKES ──────────────────────  │
       │                id · user_id(FK)             │
       │                post_id(FK)                  │
       │                UNIQUE(user_id, post_id)     │  ← 1 like/user/post
       │                                             │
       ├──── FRIENDSHIPS ───────────────────────────┤
       │       requester_id(FK) · receiver_id(FK)   │
       │       status: pending/accepted/rejected     │
       │       UNIQUE(requester_id, receiver_id)     │
       │                                             │
       ├──── MESSAGES ──────────────────────────────┤
       │       sender_id(FK) · receiver_id(FK)       │
       │       content · is_read · created_at        │
       │                                             │
       └──── REPORTS ───────────────────────────────┘
               reporter_id(FK) · reported_user_id(FK)
               reason · status: pending/resolved
```

## Points clés de conception
- **CASCADE DELETE** sur toutes les clés étrangères → cohérence garantie
- **Index** sur les colonnes fréquemment filtrées (user_id, post_id, created_at)
- **UNIQUE constraint** sur les likes → impossible de liker deux fois
- **self-join** sur les commentaires → commentaires imbriqués récursifs

---

---

# SLIDE 6 — API REST — Endpoints

## 40+ endpoints organisés par domaine

### Authentification `/api/auth`
```
POST  /register    Inscription (validation email, username, mdp)
POST  /login       Connexion → retourne JWT token
GET   /profile     Profil de l'utilisateur connecté
PUT   /profile     Modifier avatar et bio
```

### Posts `/api/posts`
```
GET    /           Liste paginée de tous les posts
POST   /           Créer un post (authentifié)
GET    /:id        Détail d'un post
PUT    /:id        Modifier (auteur uniquement)
DELETE /:id        Supprimer (auteur ou admin)
```

### Commentaires & Likes
```
POST   /posts/:id/comments     Ajouter un commentaire
GET    /posts/:id/comments     Lister les commentaires (imbriqués)
DELETE /comments/:id           Supprimer (auteur ou admin)
POST   /posts/:id/like         Toggle like/unlike
```

### Réseau social
```
POST   /friendships/request    Envoyer une demande d'ami
POST   /friendships/accept     Accepter une demande
POST   /friendships/reject     Refuser une demande
DELETE /friendships/:id        Supprimer un ami
GET    /friendships/list       Mes amis
GET    /friendships/pending    Demandes reçues
```

### Messagerie & Recherche
```
POST   /messages                    Envoyer un message privé
GET    /messages/conversations      Toutes mes conversations
GET    /messages/conversation/:id   Messages avec un utilisateur
GET    /search?q=motclé             Recherche full-text dans les posts
```

### Administration (admin uniquement)
```
GET    /admin/users           Liste des utilisateurs
POST   /admin/users/:id/ban   Bannir / débannir
DELETE /admin/posts/:id       Supprimer n'importe quel post
GET    /admin/reports         Voir les signalements
PUT    /admin/reports/:id     Traiter un signalement
```

---

---

# SLIDE 7 — Fonctionnalités Frontend

## Pages développées

| Page | Accès | Fonctionnalité principale |
|---|---|---|
| `/` Home | Public | Feed de posts avec likes |
| `/login` | Public | Connexion JWT |
| `/register` | Public | Inscription avec validation |
| `/posts/:id` | Public | Détail post + commentaires imbriqués |
| `/search` | Public | Recherche full-text |
| `/create-post` | Protégé | Création de post |
| `/profile` | Protégé | Modifier avatar + bio |
| `/friends` | Protégé | Gestion d'amis (3 onglets) |
| `/messages` | Protégé | Chat privé (style WhatsApp) |

## Composants transversaux

- **Navbar** — Navigation conditionnelle selon l'état de connexion
- **ProtectedRoute** — Redirection automatique vers `/login` si non connecté
- **AuthContext** — État global de l'utilisateur partagé dans toute l'app
- **Toast notifications** — Feedback utilisateur sur toutes les actions

## Sécurité côté client
- Token JWT stocké dans `localStorage`
- Intercepteur Axios : injection automatique du header `Authorization: Bearer`
- Redirection automatique sur expiration du token (401)
- Affichage conditionnel des boutons admin/auteur selon les droits

---

---

# SLIDE 8 — Méthode de travail : Git Flow

## Organisation avec GitHub

Nous avons appliqué une **méthodologie de versionnement structurée** inspirée du modèle Git Flow, tel qu'enseigné en Génie Logiciel.

### Structure des branches

```
main ─────────────────────────────────────────── Production stable
  │
  └── develop ──────────────────────────────────── Intégration continue
        │
        ├── feature/abdel-auth-backend ────────── ABDEL
        ├── feature/abdel-database-schema ──────── ABDEL
        ├── feature/abdel-posts-api ────────────── ABDEL
        ├── feature/abdel-admin-panel ──────────── ABDEL
        │
        ├── feature/aymen-frontend-setup ────────── AYMEN
        ├── feature/aymen-auth-pages ────────────── AYMEN
        ├── feature/aymen-post-components ──────── AYMEN
        ├── feature/aymen-messages-ui ──────────── AYMEN
        │
        └── feature/common-friendship-messages ─── Collaboration croisée
```

### Règles de contribution
- Chaque fonctionnalité développée sur **sa propre branche**
- **Pull Request obligatoire** pour merger sur `develop`
- **Code review** croisé avant merge (ABDEL review → AYMEN et inversement)
- Merge sur `main` uniquement quand `develop` est stable et testé
- **Messages de commit** conventionnels : `feat:`, `fix:`, `refactor:`, `docs:`

---

---

# SLIDE 9 — Répartition des tâches

## ABDEL — Backend & Architecture

### Sprint 1 — Fondations (Semaine 1-2)
- ✅ Initialisation du projet Node.js + Express + TypeScript
- ✅ Configuration MySQL, création du schéma de base (`schema.sql`)
- ✅ Modèle `User` : inscription, hachage bcrypt, login
- ✅ Middleware JWT : `authenticate` + `isAdmin`
- ✅ Middleware validation (`express-validator`) et gestion d'erreurs globale

### Sprint 2 — Fonctionnalités core (Semaine 3-4)
- ✅ CRUD complet des posts (Model + Controller + Routes)
- ✅ Système de commentaires imbriqués (`parent_comment_id`)
- ✅ Système de likes avec contrainte UNIQUE
- ✅ Moteur de recherche multi-critères (q / author / date)

### Sprint 3 — Fonctionnalités avancées (Semaine 5-6)
- ✅ Système d'amitié bidirectionnel (Friendship model + `CASE WHEN` SQL)
- ✅ Messagerie privée (`IF()` SQL pour interlocuteur, `markAsRead`)
- ✅ Panel d'administration (ban, suppression, gestion des reports)
- ✅ Déploiement et documentation finale

---

## AYMEN — Frontend & UX

### Sprint 1 — Setup & Auth (Semaine 1-2)
- ✅ Initialisation Vite + React + TypeScript + TailwindCSS
- ✅ Configuration Axios avec intercepteurs (injection token + gestion 401)
- ✅ `AuthContext` : état global utilisateur, login/register/logout
- ✅ Pages Login et Register avec validation côté client
- ✅ Composant `ProtectedRoute` + `Navbar` responsive

### Sprint 2 — Pages principales (Semaine 3-4)
- ✅ Page Home : feed de posts avec like toggle
- ✅ Page PostDetail : affichage du post + commentaires récursifs imbriqués
- ✅ Page CreatePost : formulaire avec validation + redirection
- ✅ Page Search : recherche full-text avec affichage dynamique des résultats
- ✅ Page Profile : mode lecture / mode édition avatar + bio

### Sprint 3 — Réseau social (Semaine 5-6)
- ✅ Page Friends : 3 onglets (amis / reçues / envoyées) + recherche d'utilisateurs
- ✅ Page Messages : interface chat style WhatsApp, bulles colorées, liste de conversations
- ✅ Services API dédiés (friendService, messageService)
- ✅ Intégration finale, tests et ajustements UX

---

---

# SLIDE 10 — Workflow GitHub en pratique

## Exemple concret d'un cycle de développement

### Étape 1 — Création de la branche feature
```bash
git checkout develop
git pull origin develop
git checkout -b feature/abdel-posts-api
```

### Étape 2 — Développement avec commits conventionnels
```bash
git add backend/src/models/Post.ts
git commit -m "feat: add Post model with pagination and author JOIN"

git add backend/src/controllers/postController.ts
git commit -m "feat: add CRUD controller for posts with ownership check"

git add backend/src/routes/postRoutes.ts
git commit -m "feat: wire post routes with auth middleware"
```

### Étape 3 — Push et Pull Request
```bash
git push origin feature/abdel-posts-api
# → Ouverture d'une Pull Request sur GitHub
# → Review par AYMEN : vérification de la cohérence des types, des routes
# → Ajustements si besoin
# → Merge sur develop après approbation
```

### Étape 4 — Synchronisation croisée
```bash
# AYMEN met à jour son develop pour récupérer les nouveaux endpoints
git checkout develop
git pull origin develop
git checkout feature/aymen-post-components
git rebase develop   # Rebase pour éviter les merge commits parasites
```

### Exemple de messages de commit réels
```
feat: implement JWT authentication middleware
feat: add bcrypt password hashing on register
fix: correct UNIQUE constraint handling on like toggle (ER_DUP_ENTRY)
refactor: extract SQL queries to Post model class
docs: add comments to all backend source files
feat: add recursive comment rendering with depth tracking
fix: handle 401 response in Axios interceptor with toast notification
feat: implement private messaging with IF() SQL for interlocutor detection
```

---

---

# SLIDE 11 — Sécurité

## Mesures de sécurité implémentées

### Authentification & Autorisation
| Mécanisme | Implémentation |
|---|---|
| Hachage mot de passe | bcrypt avec salt rounds (coût 10) |
| Tokens d'accès | JWT signé (HS256), expiration configurable |
| Vérification côté serveur | Middleware `authenticate` sur chaque route protégée |
| Contrôle des rôles | Middleware `isAdmin` pour les routes admin |

### Validation des entrées
- `express-validator` valide **chaque champ** avant traitement
- Longueurs min/max sur username, password, titre, contenu
- Format email vérifié côté serveur
- Paramètres de recherche et pagination validés et bornés

### Protection contre les attaques
- **Injections SQL** : utilisation exclusive de requêtes paramétrées (`?` placeholders)
- **Accès non autorisé** : vérification `user_id === post.user_id` avant modification
- **Double like** : contrainte UNIQUE en base (`ER_DUP_ENTRY` géré proprement)
- **Utilisateurs bannis** : vérification `is_banned` au login
- **CORS** : configuration explicite des origines autorisées

---

---

# SLIDE 12 — Difficultés rencontrées & Solutions

## Défis techniques surmontés

### 1. Commentaires imbriqués récursifs
**Problème :** Afficher des réponses à des réponses (profondeur variable) sans N+1 requêtes.

**Solution :** Chargement de tous les commentaires d'un post en une seule requête, puis reconstruction de l'arborescence côté backend avec `parent_comment_id`. Rendu récursif côté React avec `renderComment(comment, depth)`.

---

### 2. Messagerie privée — détecter l'interlocuteur
**Problème :** Dans la table `messages`, les rôles `sender`/`receiver` s'inversent selon le sens.

**Solution :** Requête SQL avec `IF(sender_id = ?, receiver_id, sender_id) AS user_id` pour toujours retourner l'ID de l'autre personne, quelle que soit la direction du message.

---

### 3. Synchronisation frontend/backend en cours de développement
**Problème :** AYMEN avait besoin des endpoints avant qu'ABDEL les finisse.

**Solution :** Définition préalable des **interfaces TypeScript partagées** et des contrats d'API (méthode, URL, payload, réponse) avant le développement. Cela a permis à AYMEN de mocquer les services et de développer l'UI en parallèle.

---

### 4. Toggle like sans doublon
**Problème :** Deux clics rapides peuvent créer une race condition et insérer deux likes.

**Solution :** Contrainte `UNIQUE(user_id, post_id)` en base de données. En cas de doublon, MySQL retourne `ER_DUP_ENTRY` → le serveur interprète ça comme un "déjà liké" et effectue un `DELETE` à la place.

---

### 5. Gestion du token JWT côté frontend
**Problème :** Passer le token dans chaque requête Axios manuellement = code dupliqué.

**Solution :** Intercepteur Axios global qui injecte automatiquement `Authorization: Bearer <token>` sur chaque requête sortante, et redirige vers `/login` sur toute réponse 401.

---

---

# SLIDE 13 — Démonstration — Parcours utilisateur

## Scénario de démonstration

```
1. INSCRIPTION
   → /register : création du compte avec validation (pseudo, email, mdp)
   → Connexion automatique + redirection vers l'accueil

2. NAVIGATION DU FEED
   → /         : liste des posts avec likes, auteurs, dates
   → Clic sur un post → /posts/:id : contenu complet + commentaires imbriqués

3. CRÉATION DE CONTENU
   → /create-post : formulaire titre + contenu
   → Redirection automatique vers le post créé

4. INTERACTION SOCIALE
   → Like/unlike sur un post (toggle instantané)
   → Ajout d'un commentaire
   → Réponse à un commentaire (imbrication)

5. RÉSEAU D'AMIS
   → /friends : onglet "Rechercher" → trouver un utilisateur
   → Envoyer une demande → onglet "Demandes envoyées"
   → L'autre utilisateur accepte → onglet "Mes amis"

6. MESSAGERIE PRIVÉE
   → /messages : démarrer une conversation
   → Bulles bleues (messages envoyés) / grises (reçus)

7. RECHERCHE
   → /search : chercher un mot-clé → résultats en temps réel

8. ESPACE ADMIN (compte admin)
   → Bannir un utilisateur
   → Supprimer un post
   → Traiter un signalement
```

---

---

# SLIDE 14 — Bilan & Perspectives

## Ce que ce projet nous a apporté

### Compétences techniques acquises
- Conception d'une **API REST complète** avec authentification JWT
- **Architecture MVC** appliquée sur un projet de taille réelle
- Gestion d'une base de données **relationnelle** avec des jointures complexes
- **TypeScript full-stack** : typage de bout en bout, interfaces partagées
- Développement d'une **SPA React** avec état global et routing protégé
- Sécurisation des entrées, gestion des erreurs, contrôle des droits

### Compétences méthodologiques
- Collaboration sur GitHub avec **branches feature + Pull Requests**
- **Commits atomiques** avec messages conventionnels
- **Répartition claire des tâches** par domaine et par sprint
- Résolution de conflits de merge
- Documentation du code et des APIs

## Améliorations possibles
- 🔄 WebSockets pour la messagerie en temps réel (actuellement polling)
- 📱 PWA / application mobile (React Native)
- 🔍 Moteur de recherche full-text avec Elasticsearch
- 🐳 Conteneurisation avec Docker + Docker Compose
- 🧪 Tests unitaires et d'intégration (Jest + Supertest)
- ☁️ Déploiement cloud (AWS / DigitalOcean)

---

---

# SLIDE 15 — Conclusion

## Un projet de bout en bout

> En partant d'une page blanche, nous avons conçu et développé une **application web complète** intégrant les problématiques réelles d'un projet professionnel :
> authentification sécurisée, gestion des rôles, modération, réseau social, messagerie et recherche.

## La clé : le versionnement collaboratif

> L'utilisation rigoureuse de **Git Flow** et de **GitHub** nous a permis de travailler en parallèle sans conflits, de garder un historique propre de toutes nos décisions techniques, et de livrer un projet cohérent malgré la répartition des tâches.

---

## Merci de votre attention

| | |
|---|---|
| **ABDEL** — Abdelmoughite SEDRY | Backend, Architecture, Base de données |
| **AYMEN** — Aymen NAOURA | Frontend, UX, Intégration |

### Technologies utilisées
`Node.js` · `Express` · `TypeScript` · `MySQL` · `JWT` · `bcrypt`
`React 18` · `Vite` · `TailwindCSS` · `Axios` · `React Router v6`
`GitHub` · `Git Flow`

---

*M1 Sécurité Informatique — Semestre 8*
