// Modèle Post : encapsule toutes les opérations de base de données liées aux posts du forum
// Les requêtes utilisent des JOIN pour récupérer aussi les infos de l'auteur (username, avatar)

import pool from '../config/database';
import { Post } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class PostModel {
  /**
   * Crée un nouveau post en base de données
   * @returns L'ID auto-incrémenté du post créé
   */
  static async create(userId: number, title: string, content: string): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)',
      [userId, title, content]
    );
    return result.insertId;
  }

  /**
   * Récupère un post par son ID avec les informations de l'auteur
   * Le JOIN avec la table users permet d'avoir username et avatar directement
   * @returns Le post avec les données de l'auteur, ou null si non trouvé
   */
  static async findById(id: number): Promise<any | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT p.*, u.username, u.avatar
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Récupère tous les posts de manière paginée, triés du plus récent au plus ancien
   * @param limit  - Nombre de posts par page (défaut: 20)
   * @param offset - Décalage pour la pagination (page 2 = offset 20 si limit=20)
   */
  static async getAll(limit: number = 20, offset: number = 0): Promise<any[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT p.*, u.username, u.avatar
       FROM posts p
       JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return rows;
  }

  /**
   * Récupère tous les posts d'un utilisateur spécifique, triés du plus récent au plus ancien
   * Utilisé pour afficher le profil d'un utilisateur
   */
  static async getByUserId(userId: number, limit: number = 20, offset: number = 0): Promise<any[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT p.*, u.username, u.avatar
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    return rows;
  }

  /**
   * Met à jour le titre et le contenu d'un post
   * La condition AND user_id = ? garantit qu'un utilisateur ne peut modifier que SES posts
   * @returns true si la mise à jour a réussi, false si le post n'existe pas ou n'appartient pas à userId
   */
  static async update(id: number, userId: number, title: string, content: string): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE posts SET title = ?, content = ? WHERE id = ? AND user_id = ?',
      [title, content, id, userId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Supprime un post (par son auteur)
   * La condition AND user_id = ? empêche la suppression de posts d'autres utilisateurs
   * @returns true si la suppression a réussi
   */
  static async delete(id: number, userId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM posts WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Supprime un post sans vérification de propriété (réservé aux admins)
   * Pas de condition sur user_id : un admin peut supprimer n'importe quel post
   * @returns true si la suppression a réussi
   */
  static async deleteByAdmin(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM posts WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Incrémente le compteur de likes d'un post de 1
   * Appelé quand un utilisateur like un post
   */
  static async incrementLikes(postId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?',
      [postId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Décrémente le compteur de likes d'un post de 1
   * La condition likes_count > 0 empêche d'avoir un compteur négatif
   * Appelé quand un utilisateur retire son like
   */
  static async decrementLikes(postId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE posts SET likes_count = likes_count - 1 WHERE id = ? AND likes_count > 0',
      [postId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Recherche des posts par mots-clés dans le titre ou le contenu
   * Utilise LIKE avec des wildcards (%) pour une recherche partielle
   * @param query - Le terme à rechercher
   */
  static async search(query: string, limit: number = 20): Promise<any[]> {
    // Ajout des wildcards % autour du terme pour chercher en sous-chaîne
    const searchTerm = `%${query}%`;
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT p.*, u.username, u.avatar
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.title LIKE ? OR p.content LIKE ?
       ORDER BY p.created_at DESC
       LIMIT ?`,
      [searchTerm, searchTerm, limit]
    );
    return rows;
  }

  /**
   * Recherche des posts par nom d'auteur
   * La recherche est partielle (LIKE %username%) pour plus de flexibilité
   */
  static async searchByAuthor(username: string, limit: number = 20): Promise<any[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT p.*, u.username, u.avatar
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE u.username LIKE ?
       ORDER BY p.created_at DESC
       LIMIT ?`,
      [`%${username}%`, limit]
    );
    return rows;
  }

  /**
   * Recherche des posts publiés à une date précise
   * Utilise DATE() pour extraire uniquement la partie date du timestamp created_at
   * @param date - Date au format YYYY-MM-DD
   */
  static async searchByDate(date: string, limit: number = 20): Promise<any[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT p.*, u.username, u.avatar
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE DATE(p.created_at) = ?
       ORDER BY p.created_at DESC
       LIMIT ?`,
      [date, limit]
    );
    return rows;
  }
}
