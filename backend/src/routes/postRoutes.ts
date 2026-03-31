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

/**
 * @swagger
 * /posts:
 *   post:
 *     tags: [Posts]
 *     summary: Créer un nouveau post
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 255
 *               content:
 *                 type: string
 *                 minLength: 10
 *     responses:
 *       201:
 *         description: Post créé
 *       401:
 *         description: Non authentifié
 */
router.post('/', authenticate, postValidation, createPost);

/**
 * @swagger
 * /posts:
 *   get:
 *     tags: [Posts]
 *     summary: Liste tous les posts
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Liste des posts
 */
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
