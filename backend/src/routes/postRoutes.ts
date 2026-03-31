// Routes des posts du forum
// Préfixe : /api/posts (défini dans server.ts)

import { Router } from 'express';
import {
  createPost,
  getAllPosts,
  getPostById,
  getUserPosts,
  updatePost,
  deletePost
} from '../controllers/postController';
import { authenticate } from '../middleware/auth';
import { postValidation, idParamValidation } from '../middleware/validation';

const router = Router();

// POST /api/posts → Crée un nouveau post
// Nécessite : token JWT valide + titre/contenu valides
router.post('/', authenticate, postValidation, createPost);

// GET /api/posts → Liste tous les posts (paginé via ?limit=&offset=)
// Public : pas d'authentification requise
router.get('/', getAllPosts);

// GET /api/posts/:id → Récupère un post spécifique par son ID
// idParamValidation vérifie que :id est bien un entier
router.get('/:id', idParamValidation, getPostById);

// GET /api/posts/user/:userId → Récupère tous les posts d'un utilisateur
// Public : permet de voir les posts d'un profil
router.get('/user/:userId', getUserPosts);

// PUT /api/posts/:id → Met à jour un post (titre et/ou contenu)
// Nécessite : token JWT + validation du post + seul l'auteur peut modifier
router.put('/:id', authenticate, idParamValidation, postValidation, updatePost);

// DELETE /api/posts/:id → Supprime un post
// Nécessite : token JWT + seul l'auteur peut supprimer (sauf admin via adminRoutes)
router.delete('/:id', authenticate, idParamValidation, deletePost);

export default router;
