# Forum de Discussion - Frontend

Frontend React pour le forum de discussion développé avec React, TypeScript et Tailwind CSS.

## Auteurs
- Abdelmoughite SEDRY
- Aymène NAOURA

## Stack Technique
- **Framework**: React 18
- **Langage**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: React Query
- **HTTP Client**: Axios
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

## Structure du Projet
```
frontend/
├── src/
│   ├── components/      # Composants réutilisables
│   ├── pages/          # Pages de l'application
│   ├── hooks/          # Hooks personnalisés
│   ├── types/          # Types TypeScript
│   ├── utils/          # Utilitaires (API, etc.)
│   ├── App.tsx         # Composant principal
│   ├── main.tsx        # Point d'entrée
│   └── index.css       # Styles globaux
├── public/             # Fichiers statiques
├── dist/               # Code buildé
└── node_modules/       # Dépendances
```

## Installation

1. Installer les dépendances:
```bash
cd frontend
npm install
```

2. Démarrer le serveur de développement:
```bash
npm run dev
```

L'application sera disponible sur http://localhost:3000

## Scripts disponibles
- `npm run dev` - Démarrer le serveur de développement
- `npm run build` - Build pour la production
- `npm run preview` - Prévisualiser le build de production
- `npm run lint` - Linter le code

## Configuration

Le frontend est configuré pour se connecter au backend sur `http://localhost:5000`. Vous pouvez modifier cette URL dans le fichier `.env` :

```
VITE_API_URL=http://localhost:5000/api
```

## Fonctionnalités

- ✅ Page d'accueil avec présentation
- ✅ Authentification (inscription/connexion)
- ✅ Navigation responsive
- ✅ Gestion des posts (CRUD)
- ✅ Système de commentaires
- ✅ Système de likes
- ✅ Recherche avancée
- ✅ Profil utilisateur
- ✅ Panneau d'administration
- ✅ Notifications toast
- ✅ Design responsive avec Tailwind CSS

## Pages

- `/` - Page d'accueil
- `/login` - Connexion
- `/register` - Inscription
- `/posts` - Liste des posts
- `/posts/:id` - Détails d'un post
- `/create-post` - Créer un post
- `/profile` - Profil utilisateur
- `/admin` - Panneau d'administration
- `/search` - Recherche

## Développement

Le projet utilise :
- **TypeScript** pour la sécurité des types
- **React Query** pour la gestion des données serveur
- **Tailwind CSS** pour le styling
- **React Router** pour la navigation
- **Axios** pour les requêtes API

## Build Production

Pour créer une version production :
```bash
npm run build
```

Les fichiers buildés seront dans le dossier `dist/`.
