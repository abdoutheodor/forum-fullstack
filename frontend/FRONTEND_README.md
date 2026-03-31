# 🎨 Forum Frontend - Guide Complet

## 🚀 Démarrage Rapide

### 1. Configuration

**Créez le fichier `.env` à la racine du dossier frontend :**

```bash
VITE_API_URL=http://localhost:5000/api
```

### 2. Installation des dépendances

```bash
cd frontend
npm install
```

### 3. Lancer le serveur de développement

```bash
npm run dev
```

L'application sera accessible sur **http://localhost:5173**

---

## 📁 Structure du Projet

```
frontend/
├── src/
│   ├── components/          # Composants réutilisables
│   │   ├── Navbar.tsx      # Barre de navigation
│   │   └── ProtectedRoute.tsx  # Route protégée
│   ├── context/            # Contextes React
│   │   └── AuthContext.tsx # Gestion de l'authentification
│   ├── pages/              # Pages de l'application
│   │   ├── Home.tsx        # Page d'accueil (liste des posts)
│   │   ├── Login.tsx       # Page de connexion
│   │   ├── Register.tsx    # Page d'inscription
│   │   ├── PostDetail.tsx  # Détail d'un post
│   │   ├── CreatePost.tsx  # Création de post
│   │   ├── Messages.tsx    # Messagerie privée
│   │   ├── Profile.tsx     # Profil utilisateur
│   │   └── Search.tsx      # Recherche
│   ├── services/           # Services API
│   │   ├── api.ts          # Configuration Axios
│   │   ├── authService.ts  # Service d'authentification
│   │   ├── postService.ts  # Service des posts
│   │   ├── commentService.ts # Service des commentaires
│   │   └── messageService.ts # Service de messagerie
│   ├── App.tsx             # Composant principal
│   ├── main.tsx            # Point d'entrée
│   └── index.css           # Styles globaux
├── .env                    # Variables d'environnement
├── package.json            # Dépendances
└── vite.config.ts          # Configuration Vite
```

---

## 🎯 Fonctionnalités

### ✅ Authentification
- **Inscription** : Créer un compte avec username, email, password
- **Connexion** : Se connecter avec email et password
- **Déconnexion** : Se déconnecter
- **Profil** : Voir et modifier son profil (avatar, bio)

### ✅ Posts
- **Liste des posts** : Voir tous les posts sur la page d'accueil
- **Créer un post** : Publier un nouveau post (titre + contenu)
- **Détail d'un post** : Voir un post complet avec commentaires
- **Modifier un post** : Modifier son propre post
- **Supprimer un post** : Supprimer son propre post
- **Liker un post** : Aimer/retirer son like

### ✅ Commentaires
- **Ajouter un commentaire** : Commenter un post
- **Répondre à un commentaire** : Créer des discussions hiérarchiques
- **Supprimer un commentaire** : Supprimer son propre commentaire

### ✅ Messagerie Privée
- **Liste des conversations** : Voir toutes les conversations
- **Envoyer un message** : Envoyer un message privé
- **Voir une conversation** : Lire l'historique des messages
- **Messages non lus** : Badge de notification

### ✅ Recherche
- **Rechercher des posts** : Recherche par mots-clés dans les titres et contenus

---

## 🔧 Technologies Utilisées

- **React 18** - Framework UI
- **TypeScript** - Typage statique
- **Vite** - Build tool ultra-rapide
- **React Router** - Navigation
- **Axios** - Requêtes HTTP
- **TailwindCSS** - Styles
- **Lucide React** - Icônes
- **React Hot Toast** - Notifications

---

## 🎨 Pages de l'Application

### 1. Page d'Accueil (`/`)
- Liste de tous les posts
- Affichage du nombre de likes et commentaires
- Bouton pour liker directement
- Accessible sans connexion

### 2. Connexion (`/login`)
- Formulaire de connexion
- Redirection automatique après connexion
- Lien vers l'inscription

### 3. Inscription (`/register`)
- Formulaire d'inscription
- Validation des champs
- Création automatique du compte

### 4. Détail d'un Post (`/posts/:id`)
- Contenu complet du post
- Liste des commentaires hiérarchiques
- Formulaire pour ajouter un commentaire
- Boutons modifier/supprimer (si propriétaire)

### 5. Créer un Post (`/create-post`)
- **Route protégée** (connexion requise)
- Formulaire avec titre et contenu
- Publication instantanée

### 6. Messages (`/messages`)
- **Route protégée** (connexion requise)
- Liste des conversations à gauche
- Messages de la conversation sélectionnée
- Formulaire d'envoi de message

### 7. Profil (`/profile`)
- **Route protégée** (connexion requise)
- Affichage des informations utilisateur
- Modification de l'avatar et de la bio

### 8. Recherche (`/search`)
- Barre de recherche
- Résultats en temps réel
- Affichage des posts correspondants

---

## 🔐 Authentification

Le système d'authentification utilise **JWT (JSON Web Tokens)**.

### Fonctionnement :
1. L'utilisateur se connecte → Le backend renvoie un token
2. Le token est stocké dans `localStorage`
3. Toutes les requêtes API incluent le token dans le header `Authorization`
4. Si le token expire ou est invalide → Redirection vers `/login`

### Routes Protégées :
- `/create-post` - Création de post
- `/messages` - Messagerie
- `/profile` - Profil

---

## 📡 Services API

### `authService.ts`
```typescript
- register(username, email, password)
- login(email, password)
- getProfile()
- updateProfile(avatar, bio)
- logout()
```

### `postService.ts`
```typescript
- getAllPosts()
- getPostById(id)
- createPost(title, content)
- updatePost(id, title, content)
- deletePost(id)
- likePost(id)
- searchPosts(query)
```

### `commentService.ts`
```typescript
- getPostComments(postId)
- createComment(postId, content, parent_comment_id)
- deleteComment(commentId)
```

### `messageService.ts`
```typescript
- sendMessage(receiverId, content)
- getConversation(userId)
- getConversations()
- getUnreadCount()
- deleteMessage(messageId)
- deleteConversation(userId)
```

---

## 🎨 Personnalisation

### Modifier les couleurs
Éditez `tailwind.config.js` pour changer les couleurs :

```js
theme: {
  extend: {
    colors: {
      primary: '#3B82F6', // Bleu par défaut
    }
  }
}
```

### Modifier l'URL de l'API
Éditez le fichier `.env` :

```
VITE_API_URL=http://votre-api.com/api
```

---

## 🚀 Déploiement

### Build de production

```bash
npm run build
```

Les fichiers optimisés seront dans le dossier `dist/`.

### Déployer sur Netlify/Vercel

1. Connectez votre repository GitHub
2. Configurez la variable d'environnement `VITE_API_URL`
3. Build command : `npm run build`
4. Publish directory : `dist`

---

## 🐛 Résolution de Problèmes

### Erreur "Network Error"
- Vérifiez que le backend est démarré sur `http://localhost:5000`
- Vérifiez le fichier `.env`

### Erreur "401 Unauthorized"
- Votre token a expiré → Reconnectez-vous
- Le token est invalide → Supprimez `localStorage` et reconnectez-vous

### Les images ne s'affichent pas
- Vérifiez que les URLs des avatars sont valides
- Utilisez des URLs HTTPS

---

## 📝 Scripts Disponibles

```bash
npm run dev       # Lancer le serveur de développement
npm run build     # Build de production
npm run preview   # Prévisualiser le build
npm run lint      # Vérifier le code
```

---

## 🎯 Prochaines Améliorations

- [ ] Mode sombre
- [ ] Notifications en temps réel (WebSocket)
- [ ] Upload d'images pour les posts
- [ ] Pagination des posts
- [ ] Filtres avancés de recherche
- [ ] Système de tags
- [ ] Partage de posts
- [ ] Statistiques utilisateur

---

## 📞 Support

Pour toute question ou problème :
- Consultez la documentation du backend : `backend/README.md`
- Vérifiez les logs de la console navigateur (F12)

---

**Bon développement ! 🚀**
