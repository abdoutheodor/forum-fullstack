// Modèle Comment : gère les opérations de base de données pour les commentaires
// Supporte les commentaires imbriqués (réponses) via le champ parent_comment_id

import pool from '../config/database';
import { Comment } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class CommentModel {
  /**
   * Crée un nouveau commentaire sur un post
   * Si parent_comment_id est fourni, le commentaire est une réponse à un autre commentaire
   * @param parentCommentId - ID du commentaire parent (undefined pour un commentaire de niveau 1)
   * @returns L'ID du commentaire créé
   */
  static async create(postId: number, userId: number, content: string, parentCommentId?: number): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO comments (post_id, user_id, content, parent_comment_id) VALUES (?, ?, ?, ?)',
      // Si parentCommentId n'est pas fourni, on insère NULL en base (commentaire de niveau racine)
      [postId, userId, content, parentCommentId || null]
    );
    return result.insertId;
  }

  /**
   * Récupère un commentaire par son ID avec les informations de l'auteur
   * @returns Le commentaire avec username et avatar, ou null si non trouvé
   */
  static async findById(id: number): Promise<any | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT c.*, u.username, u.avatar
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Récupère tous les commentaires d'un post donné, triés chronologiquement
   * Retourne aussi bien les commentaires racines que les réponses
   * (le tri par parent est géré côté client ou dans une requête séparée)
   */
  static async getByPostId(postId: number): Promise<any[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT c.*, u.username, u.avatar
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = ?
       ORDER BY c.created_at ASC`,  // ASC pour afficher les commentaires du plus ancien au plus récent
      [postId]
    );
    return rows;
  }

  /**
   * Récupère toutes les réponses directes à un commentaire spécifique
   * Utilisé pour le chargement lazy des réponses imbriquées
   * @param parentCommentId - ID du commentaire dont on veut les réponses
   */
  static async getReplies(parentCommentId: number): Promise<any[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT c.*, u.username, u.avatar
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.parent_comment_id = ?
       ORDER BY c.created_at ASC`,
      [parentCommentId]
    );
    return rows;
  }

  /**
   * Supprime un commentaire (par son auteur)
   * La double condition (id + user_id) garantit qu'un utilisateur ne peut supprimer que SES commentaires
   * @returns true si la suppression a réussi, false si non trouvé ou non autorisé
   */
  static async delete(id: number, userId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM comments WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Supprime un commentaire sans vérification de propriété (réservé aux admins)
   * @returns true si la suppression a réussi
   */
  static async deleteByAdmin(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM comments WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Compte le nombre total de commentaires sur un post
   * Utile pour afficher le compteur de commentaires sans charger toute la liste
   */
  static async countByPostId(postId: number): Promise<number> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM comments WHERE post_id = ?',
      [postId]
    );
    return rows[0].count;
  }
}
