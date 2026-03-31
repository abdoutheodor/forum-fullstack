// Contrôleur des commentaires
// Gère la création, lecture et suppression des commentaires sur les posts
// Supporte les commentaires imbriqués (réponses) via parent_comment_id

import { Request, Response } from 'express';
import { CommentModel } from '../models/Comment';
import { AuthRequest } from '../middleware/auth';

/**
 * Crée un nouveau commentaire sur un post
 * Route: POST /api/posts/:postId/comments
 * Nécessite authentification
 *
 * Si parent_comment_id est fourni dans le body, le commentaire est une réponse
 * à un commentaire existant (commentaire imbriqué)
 */
export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    // L'ID du post est dans l'URL (/posts/:postId/comments)
    const postId = parseInt(req.params.postId);
    // parent_comment_id est optionnel : undefined = commentaire racine, nombre = réponse
    const { content, parent_comment_id } = req.body;
    const userId = req.user!.id;

    const commentId = await CommentModel.create(postId, userId, content, parent_comment_id);

    res.status(201).json({
      success: true,
      message: 'Commentaire créé avec succès',
      data: { commentId }
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Récupère tous les commentaires d'un post
 * Route: GET /api/posts/:postId/comments
 * Accessible sans authentification
 *
 * Retourne tous les commentaires (racines ET réponses) triés par date ASC
 * Le frontend peut ensuite les organiser en arbre selon parent_comment_id
 */
export const getPostComments = async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.postId);

    const comments = await CommentModel.getByPostId(postId);

    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Récupère les réponses directes à un commentaire
 * Route: GET /api/comments/:commentId/replies
 * Accessible sans authentification
 *
 * Utilisé pour le chargement lazy des réponses imbriquées
 */
export const getCommentReplies = async (req: Request, res: Response) => {
  try {
    const commentId = parseInt(req.params.commentId);

    const replies = await CommentModel.getReplies(commentId);

    res.json({
      success: true,
      data: replies
    });
  } catch (error) {
    console.error('Get replies error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Supprime un commentaire
 * Route: DELETE /api/comments/:id
 * Nécessite authentification
 *
 * La vérification de propriété (user_id = userId) est faite dans CommentModel.delete
 * Un utilisateur ne peut supprimer que SES propres commentaires
 */
export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const commentId = parseInt(req.params.id);
    const userId = req.user!.id;

    // Retourne false si le commentaire n'existe pas OU n'appartient pas à cet utilisateur
    const deleted = await CommentModel.delete(commentId, userId);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Commentaire non trouvé ou non autorisé' });
    }

    res.json({
      success: true,
      message: 'Commentaire supprimé avec succès'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
