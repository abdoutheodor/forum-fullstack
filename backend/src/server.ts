// Point d'entrée principal du serveur Express
// Ce fichier initialise l'application, configure les middlewares globaux et monte les routes

import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// Middleware global de gestion des erreurs (appelé en dernier)
import { errorHandler } from './middleware/errorHandler';
// Import de tous les routeurs de l'application
import authRoutes from './routes/authRoutes';
import postRoutes from './routes/postRoutes';
import commentRoutes from './routes/commentRoutes';
import likeRoutes from './routes/likeRoutes';
import adminRoutes from './routes/adminRoutes';
import searchRoutes from './routes/searchRoutes';
import messageRoutes from './routes/messageRoutes';
import friendshipRoutes from './routes/friendshipRoutes';
import userRoutes from './routes/userRoutes';

// Chargement des variables d'environnement depuis le fichier .env
dotenv.config();

// Création de l'instance Express
const app: Application = express();

// Lecture du port depuis les variables d'environnement, avec 5000 comme valeur par défaut
const PORT = process.env.PORT || 5000;

// Activation de CORS (Cross-Origin Resource Sharing) pour permettre les requêtes depuis le frontend
app.use(cors());

// Middleware pour parser les corps de requêtes JSON (ex: { "title": "..." })
app.use(express.json());

// Middleware pour parser les corps de requêtes URL-encodées (formulaires HTML classiques)
app.use(express.urlencoded({ extended: true }));

// Route racine : renvoie les informations de base de l'API (utile pour vérifier que le serveur tourne)
app.get('/', (_req, res) => {
  res.json({
    message: 'Forum API - Backend is running',
    version: '1.0.0',
    // Liste des endpoints disponibles pour faciliter la découverte de l'API
    endpoints: {
      auth: '/api/auth',
      posts: '/api/posts',
      comments: '/api',
      likes: '/api',
      admin: '/api/admin',
      search: '/api/search',
      messages: '/api/messages',
      friendships: '/api/friendships',
      users: '/api/users'
    }
  });
});

// Montage des routeurs sur leurs préfixes respectifs
app.use('/api/auth', authRoutes);           // Authentification (register, login, profil)
app.use('/api/posts', postRoutes);          // CRUD des posts
app.use('/api', commentRoutes);             // Commentaires (monté sur /api car les URLs incluent /posts/:id/comments)
app.use('/api', likeRoutes);               // Likes (monté sur /api car les URLs incluent /posts/:id/like)
app.use('/api/admin', adminRoutes);         // Actions réservées aux administrateurs
app.use('/api/search', searchRoutes);       // Recherche de posts
app.use('/api/messages', messageRoutes);    // Messagerie privée
app.use('/api/friendships', friendshipRoutes); // Gestion des amis
app.use('/api/users', userRoutes);          // Recherche et consultation de profils utilisateurs

// Middleware de gestion des erreurs globales
// IMPORTANT : doit être déclaré EN DERNIER pour intercepter toutes les erreurs non gérées
app.use(errorHandler);

// Démarrage du serveur sur le port configuré
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
