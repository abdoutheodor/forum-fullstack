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

// POST /api/posts/:postId/comments → Ajoute un commentaire sur un post
// Body optionnel : { parent_comment_id } pour une réponse à un autre commentaire
// Nécessite : token JWT + contenu valide
router.post('/posts/:postId/comments', authenticate, commentValidation, createComment);

// GET /api/posts/:postId/comments → Liste tous les commentaires d'un post
// Public : accessible sans authentification
router.get('/posts/:postId/comments', getPostComments);

// GET /api/comments/:commentId/replies → Récupère les réponses d'un commentaire
// Utilisé pour le chargement lazy des commentaires imbriqués
router.get('/comments/:commentId/replies', getCommentReplies);

// DELETE /api/comments/:id → Supprime un commentaire
// Nécessite : token JWT + seul l'auteur peut supprimer (sauf admin via adminRoutes)
router.delete('/comments/:id', authenticate, idParamValidation, deleteComment);

export default router;
