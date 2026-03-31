// Contrôleur administrateur
// Gère les fonctionnalités de modération réservées aux administrateurs :
// - Gestion des utilisateurs (liste, ban/unban)
// - Suppression de contenu (posts, commentaires)
// - Gestion des signalements (création, consultation, mise à jour du statut)

import { Response } from 'express';
import { UserModel } from '../models/User';
import { PostModel } from '../models/Post';
import { CommentModel } from '../models/Comment';
import { ReportModel } from '../models/Report';
import { AuthRequest } from '../middleware/auth';

/**
 * Récupère la liste paginée de tous les utilisateurs
 * Route: GET /api/admin/users?limit=50&offset=0
 * Nécessite authentification + droits admin (middleware isAdmin)
 */
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const users = await UserModel.getAllUsers(limit, offset);

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Banne ou débanne un utilisateur
 * Route: POST /api/admin/users/:id/ban
 * Nécessite authentification + droits admin
 *
 * Body: { is_banned: true | false }
 * - true  → banni (ne peut plus se connecter ni accéder aux routes protégées)
 * - false → débanni (accès rétabli)
 */
export const banUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const { is_banned } = req.body;

    // Sécurité : un admin ne peut pas se bannir lui-même
    if (userId === req.user!.id) {
      return res.status(400).json({ success: false, message: 'Vous ne pouvez pas vous bannir vous-même' });
    }

    const updated = await UserModel.banUser(userId, is_banned);

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    // Message dynamique selon l'action effectuée
    res.json({
      success: true,
      message: is_banned ? 'Utilisateur banni' : 'Utilisateur débanni'
    });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Supprime un post en tant qu'administrateur (sans vérification de propriété)
 * Route: DELETE /api/admin/posts/:id
 * Nécessite authentification + droits admin
 *
 * Contrairement à deletePost (utilisateur normal), ici l'admin peut supprimer
 * n'importe quel post quelle que soit sa propriété
 */
export const deletePostByAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const postId = parseInt(req.params.id);

    const deleted = await PostModel.deleteByAdmin(postId);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Post non trouvé' });
    }

    res.json({
      success: true,
      message: 'Post supprimé par l\'administrateur'
    });
  } catch (error) {
    console.error('Delete post by admin error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Supprime un commentaire en tant qu'administrateur (sans vérification de propriété)
 * Route: DELETE /api/admin/comments/:id
 * Nécessite authentification + droits admin
 */
export const deleteCommentByAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const commentId = parseInt(req.params.id);

    const deleted = await CommentModel.deleteByAdmin(commentId);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Commentaire non trouvé' });
    }

    res.json({
      success: true,
      message: 'Commentaire supprimé par l\'administrateur'
    });
  } catch (error) {
    console.error('Delete comment by admin error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Crée un signalement contre un utilisateur
 * Route: POST /api/admin/reports
 * Nécessite authentification SEULEMENT (tout utilisateur peut signaler)
 *
 * Note : Cette route est accessible à tous les utilisateurs authentifiés,
 * pas seulement aux admins. Les admins gèrent ensuite les signalements reçus.
 */
export const createReport = async (req: AuthRequest, res: Response) => {
  try {
    const { reported_user_id, reason } = req.body;
    const reporterId = req.user!.id;

    // Un utilisateur ne peut pas se signaler lui-même
    if (reporterId === reported_user_id) {
      return res.status(400).json({ success: false, message: 'Vous ne pouvez pas vous signaler vous-même' });
    }

    const reportId = await ReportModel.create(reporterId, reported_user_id, reason);

    res.status(201).json({
      success: true,
      message: 'Signalement créé avec succès',
      data: { reportId }
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Récupère tous les signalements avec filtrage optionnel par statut
 * Route: GET /api/admin/reports?status=pending&limit=50&offset=0
 * Nécessite authentification + droits admin
 *
 * Paramètres query optionnels :
 * - status : filtre par statut ('pending', 'reviewed', 'resolved')
 * - limit  : nombre de résultats par page
 * - offset : décalage pour la pagination
 */
export const getAllReports = async (req: AuthRequest, res: Response) => {
  try {
    const status = req.query.status as string;  // undefined si non fourni → pas de filtre
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const reports = await ReportModel.getAll(status, limit, offset);

    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Met à jour le statut d'un signalement (workflow de modération)
 * Route: PUT /api/admin/reports/:id/status
 * Nécessite authentification + droits admin
 *
 * Body: { status: 'pending' | 'reviewed' | 'resolved' }
 * Workflow typique : pending → reviewed (en cours d'examen) → resolved (traité)
 */
export const updateReportStatus = async (req: AuthRequest, res: Response) => {
  try {
    const reportId = parseInt(req.params.id);
    const { status } = req.body;

    // Validation du statut fourni (liste blanche des valeurs autorisées)
    if (!['pending', 'reviewed', 'resolved'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Statut invalide' });
    }

    const updated = await ReportModel.updateStatus(reportId, status);

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Signalement non trouvé' });
    }

    res.json({
      success: true,
      message: 'Statut du signalement mis à jour'
    });
  } catch (error) {
    console.error('Update report status error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
