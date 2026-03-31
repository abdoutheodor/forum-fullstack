// Modèle Message : gère la messagerie privée entre utilisateurs
// Chaque message a un expéditeur (sender) et un destinataire (receiver)

import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

/**
 * Interface représentant un message en base de données
 * Étend RowDataPacket pour la compatibilité avec mysql2
 */
export interface Message extends RowDataPacket {
  id: number;
  sender_id: number;               // ID de l'expéditeur
  receiver_id: number;             // ID du destinataire
  content: string;                 // Contenu du message
  is_read: boolean;                // false = message non lu par le destinataire
  created_at: Date;
  sender_username?: string;        // Champ enrichi via JOIN (pas en base directement)
  receiver_username?: string;      // Champ enrichi via JOIN (pas en base directement)
}

export class MessageModel {
  /**
   * Envoie un nouveau message
   * @returns L'ID du message créé
   */
  static async create(senderId: number, receiverId: number, content: string): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
      [senderId, receiverId, content]
    );
    return result.insertId;
  }

  /**
   * Récupère la conversation entre deux utilisateurs (messages dans les deux sens)
   * Les messages sont retournés triés du plus récent au plus ancien (ORDER BY DESC)
   * Note : le contrôleur appelle .reverse() pour les afficher dans l'ordre chronologique
   *
   * @param userId1 - ID du premier utilisateur
   * @param userId2 - ID du second utilisateur
   * @param limit   - Nombre maximum de messages à charger (défaut: 50)
   */
  static async getConversation(userId1: number, userId2: number, limit: number = 50): Promise<Message[]> {
    const [rows] = await pool.execute<Message[]>(
      `SELECT m.*,
              u1.username as sender_username,
              u2.username as receiver_username
       FROM messages m
       JOIN users u1 ON m.sender_id = u1.id
       JOIN users u2 ON m.receiver_id = u2.id
       -- Récupère les messages envoyés par userId1 à userId2 ET par userId2 à userId1
       WHERE (m.sender_id = ? AND m.receiver_id = ?)
          OR (m.sender_id = ? AND m.receiver_id = ?)
       ORDER BY m.created_at DESC
       LIMIT ?`,
      [userId1, userId2, userId2, userId1, limit]
    );
    return rows;
  }

  /**
   * Récupère la liste des conversations d'un utilisateur
   * Pour chaque conversation, retourne le dernier message et les infos de l'interlocuteur
   *
   * Utilise IF() pour détecter le rôle de userId dans chaque message :
   * - Si userId est l'expéditeur → l'interlocuteur est le destinataire (u2)
   * - Si userId est le destinataire → l'interlocuteur est l'expéditeur (u1)
   */
  static async getUserConversations(userId: number): Promise<any[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT DISTINCT
         IF(m.sender_id = ?, m.receiver_id, m.sender_id) as user_id,
         IF(m.sender_id = ?, u2.username, u1.username) as username,
         IF(m.sender_id = ?, u2.avatar, u1.avatar) as avatar,
         m.content as last_message,           -- Contenu du dernier message de la conversation
         m.created_at as last_message_time    -- Date du dernier message
       FROM messages m
       INNER JOIN users u1 ON m.sender_id = u1.id
       INNER JOIN users u2 ON m.receiver_id = u2.id
       WHERE m.sender_id = ? OR m.receiver_id = ?
       GROUP BY user_id
       ORDER BY m.created_at DESC`,
      [userId, userId, userId, userId, userId]
    );
    return rows;
  }

  /**
   * Marque comme lus tous les messages non lus d'un expéditeur vers un destinataire
   * Appelé quand un utilisateur ouvre une conversation : les messages de l'autre deviennent lus
   *
   * @param senderId   - ID de l'expéditeur dont on marque les messages comme lus
   * @param receiverId - ID du destinataire qui lit les messages
   * @returns true si au moins un message a été mis à jour (il y avait des non-lus)
   */
  static async markAsRead(senderId: number, receiverId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE',
      [senderId, receiverId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Compte le nombre de messages non lus pour un utilisateur
   * Utilisé pour afficher le badge de notifications dans l'interface
   */
  static async getUnreadCount(userId: number): Promise<number> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = FALSE',
      [userId]
    );
    return rows[0].count;
  }

  /**
   * Supprime un message spécifique
   * La condition sender_id = userId garantit qu'on ne peut supprimer que SES propres messages
   * @returns true si la suppression a réussi
   */
  static async deleteMessage(messageId: number, userId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM messages WHERE id = ? AND sender_id = ?',
      [messageId, userId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Supprime toute la conversation entre deux utilisateurs (dans les deux sens)
   * @returns true si au moins un message a été supprimé
   */
  static async deleteConversation(userId1: number, userId2: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      // Supprime tous les messages entre les deux utilisateurs dans les deux directions
      'DELETE FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)',
      [userId1, userId2, userId2, userId1]
    );
    return result.affectedRows > 0;
  }
}
