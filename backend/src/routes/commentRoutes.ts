// Routes des commentaires
// Préfixe : /api (défini dans server.ts)
// Les URLs complètes incluent le contexte du post : /api/posts/:postId/comments

import { Router } from 'express';
import {
  createComment,
  getPostComments,
  getCommentReplies,
  deleteComment
} from '../controllers/commentController';
import { authenticate } from '../middleware/auth';
import { commentValidation, idParamValidation } from '../middleware/validation';

const router = Router();

/**
 * @swagger
 * /posts/{postId}/comments:
 *   post:
 *     tags: [Comments]
 *     summary: Ajouter un commentaire
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *               parent_comment_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Commentaire créé
 *       401:
 *         description: Non authentifié
 */
router.post('/posts/:postId/comments', authenticate, commentValidation, createComment);

/**
 * @swagger
 * /posts/{postId}/comments:
 *   get:
 *     tags: [Comments]
 *     summary: Liste des commentaires d'un post
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des commentaires
 */
router.get('/posts/:postId/comments', getPostComments);

// GET /api/comments/:commentId/replies → Récupère les réponses d'un commentaire
// Utilisé pour le chargement lazy des commentaires imbriqués
router.get('/comments/:commentId/replies', getCommentReplies);

// DELETE /api/comments/:id → Supprime un commentaire
// Nécessite : token JWT + seul l'auteur peut supprimer (sauf admin via adminRoutes)
router.delete('/comments/:id', authenticate, idParamValidation, deleteComment);

export default router;
