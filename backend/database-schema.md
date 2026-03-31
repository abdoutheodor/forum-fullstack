# Schéma UML de la Base de Données - Forum de Discussion

## Diagramme de Classes (UML)

```
┌─────────────────────────────────────┐
│             USERS                   │
├─────────────────────────────────────┤
│ PK  id: INT                         │
│     username: VARCHAR(50) UNIQUE    │
│     email: VARCHAR(100) UNIQUE      │
│     password: VARCHAR(255)          │
│     avatar: VARCHAR(255)            │
│     bio: TEXT                       │
│     is_admin: BOOLEAN               │
│     is_banned: BOOLEAN              │
│     created_at: TIMESTAMP           │
│     updated_at: TIMESTAMP           │
└─────────────────────────────────────┘
         │                    │
         │                    │
         │ 1                  │ 1
         │                    │
         │                    │
         │ *                  │ *
┌────────▼──────────┐  ┌──────▼──────────────────┐
│      POSTS        │  │       REPORTS           │
├───────────────────┤  ├─────────────────────────┤
│ PK  id: INT       │  │ PK  id: INT             │
│ FK  user_id: INT  │  │ FK  reporter_id: INT    │
│     title: VARCHAR│  │ FK  reported_user_id    │
│     content: TEXT │  │     reason: TEXT        │
│     likes_count   │  │     status: VARCHAR(20) │
│     created_at    │  │     created_at          │
│     updated_at    │  └─────────────────────────┘
└───────────────────┘
         │
         │ 1
         │
         │
         │ *
┌────────▼──────────────────┐
│       COMMENTS            │
├───────────────────────────┤
│ PK  id: INT               │
│ FK  post_id: INT          │
│ FK  user_id: INT          │
│ FK  parent_comment_id: INT│
│     content: TEXT         │
│     created_at: TIMESTAMP │
│     updated_at: TIMESTAMP │
└───────────────────────────┘
         │
         │ 1
         │
         │
         │ *
         └──────┐ (auto-référence)
                │ pour les réponses
                │ aux commentaires

┌─────────────────────────┐
│        LIKES            │
├─────────────────────────┤
│ PK  id: INT             │
│ FK  user_id: INT        │
│ FK  post_id: INT        │
│     created_at          │
│ UNIQUE(user_id, post_id)│
└─────────────────────────┘
         │
         │ *
         │
         │ 1
         └──────► POSTS
```

## Relations

### 1. **USERS → POSTS** (1:N)
- Un utilisateur peut créer plusieurs posts
- Chaque post appartient à un seul utilisateur
- `CASCADE ON DELETE` : Si un utilisateur est supprimé, tous ses posts sont supprimés

### 2. **USERS → COMMENTS** (1:N)
- Un utilisateur peut écrire plusieurs commentaires
- Chaque commentaire appartient à un seul utilisateur
- `CASCADE ON DELETE` : Si un utilisateur est supprimé, tous ses commentaires sont supprimés

### 3. **POSTS → COMMENTS** (1:N)
- Un post peut avoir plusieurs commentaires
- Chaque commentaire appartient à un seul post
- `CASCADE ON DELETE` : Si un post est supprimé, tous ses commentaires sont supprimés

### 4. **COMMENTS → COMMENTS** (1:N - Auto-référence)
- Un commentaire peut avoir plusieurs réponses (commentaires enfants)
- Chaque réponse peut référencer un commentaire parent
- `parent_comment_id` peut être NULL (commentaire de premier niveau)
- `CASCADE ON DELETE` : Si un commentaire parent est supprimé, toutes ses réponses sont supprimées

### 5. **USERS → LIKES** (1:N)
- Un utilisateur peut liker plusieurs posts
- Chaque like appartient à un seul utilisateur
- `CASCADE ON DELETE` : Si un utilisateur est supprimé, tous ses likes sont supprimés

### 6. **POSTS → LIKES** (1:N)
- Un post peut avoir plusieurs likes
- Chaque like appartient à un seul post
- `CASCADE ON DELETE` : Si un post est supprimé, tous ses likes sont supprimés
- **Contrainte UNIQUE** : Un utilisateur ne peut liker qu'une seule fois le même post

### 7. **USERS → REPORTS** (1:N - Double relation)
- **reporter_id** : Un utilisateur peut signaler plusieurs autres utilisateurs
- **reported_user_id** : Un utilisateur peut être signalé plusieurs fois
- `CASCADE ON DELETE` : Si un utilisateur est supprimé, tous les signalements le concernant sont supprimés

## Cardinalités

```
USERS (1) ──────< (N) POSTS
USERS (1) ──────< (N) COMMENTS
USERS (1) ──────< (N) LIKES
USERS (1) ──────< (N) REPORTS (reporter)
USERS (1) ──────< (N) REPORTS (reported)

POSTS (1) ──────< (N) COMMENTS
POSTS (1) ──────< (N) LIKES

COMMENTS (1) ──────< (N) COMMENTS (réponses)
```

## Index pour Optimisation

- `idx_posts_user_id` : Recherche rapide des posts par utilisateur
- `idx_posts_created_at` : Tri des posts par date (DESC)
- `idx_comments_post_id` : Recherche rapide des commentaires d'un post
- `idx_comments_user_id` : Recherche rapide des commentaires d'un utilisateur
- `idx_likes_post_id` : Comptage rapide des likes d'un post
- `idx_reports_status` : Filtrage rapide des signalements par statut

## Contraintes d'Intégrité

1. **UNIQUE** :
   - `users.username`
   - `users.email`
   - `likes(user_id, post_id)` - Un utilisateur ne peut liker qu'une fois le même post

2. **NOT NULL** :
   - Tous les champs essentiels (username, email, password, title, content, etc.)

3. **FOREIGN KEYS avec CASCADE** :
   - Toutes les relations utilisent `ON DELETE CASCADE` pour maintenir l'intégrité référentielle

4. **DEFAULT VALUES** :
   - `is_admin = FALSE`
   - `is_banned = FALSE`
   - `likes_count = 0`
   - `status = 'pending'` (pour reports)
   - `created_at = CURRENT_TIMESTAMP`
   - `updated_at = CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`
