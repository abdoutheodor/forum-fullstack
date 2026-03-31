// Contrôleur des likes
// Gère le système de like/unlike sur les posts (fonctionnement toggle)

import { Response } from 'express';
import { LikeModel } from '../models/Like';
import { PostModel } from '../models/Post';
import { AuthRequest } from '../middleware/auth';

/**
 * Bascule le like d'un utilisateur sur un post (toggle)
 * Route: POST /api/posts/:postId/like
 * Nécessite authentification
 *
 * - Si l'utilisateur a déjà liké → retire le like (unlike)
 * - Si l'utilisateur n'a pas liké → ajoute le like
 *
 * Met également à jour le compteur likes_count dans la table posts
 */
export const toggleLike = async (req: AuthRequest, res: Response) => {
  try {
    const postId = parseInt(req.params.postId);
    const userId = req.user!.id;

    // Vérifie si l'utilisateur a déjà liké ce post
    const exists = await LikeModel.exists(userId, postId);

    if (exists) {
      // L'utilisateur avait déjà liké → on retire son like
      await LikeModel.delete(userId, postId);
      // Décrémentation du compteur dans la table posts
      await PostModel.decrementLikes(postId);

      res.json({
        success: true,
        message: 'Like retiré',
        data: { liked: false }  // Indique au frontend que le post n'est plus liké
      });
    } else {
      // L'utilisateur n'avait pas encore liké → on ajoute son like
      const likeId = await LikeModel.create(userId, postId);

      // likeId null = doublon détecté en base (cas de race condition, sécurité supplémentaire)
      if (likeId === null) {
        return res.status(400).json({ success: false, message: 'Déjà liké' });
      }

      // Incrémentation du compteur dans la table posts
      await PostModel.incrementLikes(postId);

      res.json({
        success: true,
        message: 'Post liké',
        data: { liked: true }   // Indique au frontend que le post est maintenant liké
      });
    }
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Récupère les informations de like d'un post pour l'utilisateur connecté
 * Route: GET /api/posts/:postId/likes
 * Nécessite authentification
 *
 * Retourne :
 * - count     : nombre total de likes sur le post
 * - userLiked : true si l'utilisateur connecté a liké ce post (pour afficher le bouton correctement)
 */
export const getPostLikes = async (req: AuthRequest, res: Response) => {
  try {
    const postId = parseInt(req.params.postId);

    // Récupération du nombre total de likes
    const count = await LikeModel.countByPostId(postId);
    // Vérification si l'utilisateur courant a liké ce post (pour l'état du bouton like)
    const userLiked = await LikeModel.exists(req.user!.id, postId);

    res.json({
      success: true,
      data: {
        count,
        userLiked
      }
    });
  } catch (error) {
    console.error('Get likes error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
