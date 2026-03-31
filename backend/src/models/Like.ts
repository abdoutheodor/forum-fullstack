// Modèle Like : gère les opérations de base de données pour les likes sur les posts
// La contrainte UNIQUE(user_id, post_id) en base empêche les doublons au niveau SQL

import pool from '../config/database';
import { Like } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class LikeModel {
  /**
   * Ajoute un like d'un utilisateur sur un post
   * Gère silencieusement l'erreur de doublon (l'utilisateur a déjà liké ce post)
   * @returns L'ID du like créé, ou null si le like existait déjà (doublon)
   */
  static async create(userId: number, postId: number): Promise<number | null> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'INSERT INTO likes (user_id, post_id) VALUES (?, ?)',
        [userId, postId]
      );
      return result.insertId;
    } catch (error: any) {
      // ER_DUP_ENTRY : erreur MySQL levée quand la contrainte UNIQUE est violée
      // On retourne null pour indiquer que le like existait déjà, sans lever d'exception
      if (error.code === 'ER_DUP_ENTRY') {
        return null;
      }
      // Pour toute autre erreur, on re-lance l'exception pour qu'elle soit gérée plus haut
      throw error;
    }
  }

  /**
   * Supprime le like d'un utilisateur sur un post
   * @returns true si la suppression a réussi (le like existait), false sinon
   */
  static async delete(userId: number, postId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM likes WHERE user_id = ? AND post_id = ?',
      [userId, postId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Vérifie si un utilisateur a déjà liké un post
   * Utilisé avant d'ajouter ou retirer un like (logique toggle)
   * @returns true si le like existe, false sinon
   */
  static async exists(userId: number, postId: number): Promise<boolean> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM likes WHERE user_id = ? AND post_id = ?',
      [userId, postId]
    );
    return rows.length > 0;
  }

  /**
   * Récupère tous les likes d'un post avec les détails
   * @returns Tableau d'objets Like (avec id, user_id, post_id, created_at)
   */
  static async getByPostId(postId: number): Promise<Like[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM likes WHERE post_id = ?',
      [postId]
    );
    return rows as Like[];
  }

  /**
   * Compte le nombre total de likes sur un post
   * Plus efficace que getByPostId() quand on a seulement besoin du nombre
   */
  static async countByPostId(postId: number): Promise<number> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM likes WHERE post_id = ?',
      [postId]
    );
    return rows[0].count;
  }
}
