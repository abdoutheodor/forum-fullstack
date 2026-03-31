// Contrôleur des posts du forum
// Gère la création, lecture, mise à jour et suppression des posts (CRUD)

import { Request, Response } from 'express';
import { PostModel } from '../models/Post';
import { AuthRequest } from '../middleware/auth';

/**
 * Crée un nouveau post
 * Route: POST /api/posts
 * Nécessite authentification
 */
export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content } = req.body;
    // L'ID de l'auteur est extrait du token JWT via req.user (injecté par authenticate)
    const userId = req.user!.id;

    const postId = await PostModel.create(userId, title, content);

    res.status(201).json({
      success: true,
      message: 'Post créé avec succès',
      data: { postId }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Récupère tous les posts avec pagination
 * Route: GET /api/posts?limit=20&offset=0
 * Accessible sans authentification (lecture publique)
 *
 * Paramètres query :
 * - limit  : nombre de posts par page (défaut: 20)
 * - offset : décalage pour la pagination (défaut: 0)
 */
export const getAllPosts = async (req: Request, res: Response) => {
  try {
    // Conversion des paramètres de query en nombre (parseInt) avec valeurs par défaut
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const posts = await PostModel.getAll(limit, offset);

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Get all posts error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Récupère un post spécifique par son ID
 * Route: GET /api/posts/:id
 * Accessible sans authentification
 */
export const getPostById = async (req: Request, res: Response) => {
  try {
    // Conversion de l'ID depuis le paramètre URL (toujours une string) en nombre
    const postId = parseInt(req.params.id);

    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post non trouvé' });
    }

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Récupère tous les posts d'un utilisateur spécifique
 * Route: GET /api/posts/user/:userId?limit=20&offset=0
 * Accessible sans authentification (profil public)
 */
export const getUserPosts = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const posts = await PostModel.getByUserId(userId, limit, offset);

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Met à jour un post existant
 * Route: PUT /api/posts/:id
 * Nécessite authentification
 *
 * La vérification de propriété (user_id = userId) est faite dans PostModel.update
 * Un utilisateur ne peut modifier que SES propres posts
 */
export const updatePost = async (req: AuthRequest, res: Response) => {
  try {
    const postId = parseInt(req.params.id);
    const { title, content } = req.body;
    const userId = req.user!.id;

    // PostModel.update retourne false si le post n'existe pas OU n'appartient pas à cet utilisateur
    const updated = await PostModel.update(postId, userId, title, content);

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Post non trouvé ou non autorisé' });
    }

    res.json({
      success: true,
      message: 'Post mis à jour avec succès'
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Supprime un post
 * Route: DELETE /api/posts/:id
 * Nécessite authentification
 *
 * La vérification de propriété est faite dans PostModel.delete
 * Un utilisateur ne peut supprimer que SES propres posts
 */
export const deletePost = async (req: AuthRequest, res: Response) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.user!.id;

    // PostModel.delete retourne false si le post n'existe pas OU n'appartient pas à cet utilisateur
    const deleted = await PostModel.delete(postId, userId);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Post non trouvé ou non autorisé' });
    }

    res.json({
      success: true,
      message: 'Post supprimé avec succès'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
