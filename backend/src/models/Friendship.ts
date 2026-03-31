// Modèle Friendship : gère les relations d'amitié entre utilisateurs
// Une amitié est initiée par un demandeur (requester) et reçue par un destinataire (receiver)
// Statuts possibles : 'pending' (en attente), 'accepted' (acceptée), 'rejected' (refusée)

import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

/**
 * Interface représentant une ligne de la table friendships
 */
export interface Friendship {
  id: number;
  requester_id: number;                          // ID de l'utilisateur qui a envoyé la demande
  receiver_id: number;                           // ID de l'utilisateur qui a reçu la demande
  status: 'pending' | 'accepted' | 'rejected';  // État actuel de la relation
  created_at: string;                            // Date de création de la demande
  updated_at: string;                            // Date de la dernière mise à jour
}

/**
 * Interface étendant Friendship avec les données de l'interlocuteur
 * Retournée par les méthodes qui font un JOIN avec la table users
 */
export interface FriendshipWithUser extends Friendship {
  user_id: number;    // ID de l'interlocuteur (ami ou demandeur selon le contexte)
  username: string;   // Nom d'utilisateur de l'interlocuteur
  email: string;
  avatar?: string;
}

export class FriendshipModel {
  /**
   * Envoie une demande d'ami
   * Crée une ligne avec statut 'pending' en base de données
   * @returns L'ID de la demande créée
   */
  static async sendRequest(requesterId: number, receiverId: number): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO friendships (requester_id, receiver_id, status) VALUES (?, ?, ?)',
      [requesterId, receiverId, 'pending']
    );
    return result.insertId;
  }

  /**
   * Accepte une demande d'ami
   * Change le statut de 'pending' à 'accepted' et met à jour updated_at
   * La condition AND status = 'pending' évite de réaccepter une demande déjà traitée
   */
  static async acceptRequest(requesterId: number, receiverId: number): Promise<void> {
    await pool.execute(
      'UPDATE friendships SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE requester_id = ? AND receiver_id = ? AND status = ?',
      ['accepted', requesterId, receiverId, 'pending']
    );
  }

  /**
   * Refuse une demande d'ami
   * Change le statut de 'pending' à 'rejected'
   * La condition AND status = 'pending' évite de refuser une demande déjà acceptée
   */
  static async rejectRequest(requesterId: number, receiverId: number): Promise<void> {
    await pool.execute(
      'UPDATE friendships SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE requester_id = ? AND receiver_id = ? AND status = ?',
      ['rejected', requesterId, receiverId, 'pending']
    );
  }

  /**
   * Supprime une relation d'amitié (dans les deux sens)
   * Fonctionne que userId soit le demandeur ou le destinataire original
   */
  static async removeFriend(userId: number, friendId: number): Promise<void> {
    await pool.execute(
      // Double condition OR pour gérer les deux directions possibles de la relation
      'DELETE FROM friendships WHERE (requester_id = ? AND receiver_id = ?) OR (requester_id = ? AND receiver_id = ?)',
      [userId, friendId, friendId, userId]
    );
  }

  /**
   * Récupère la liste des amis d'un utilisateur (relations acceptées uniquement)
   *
   * Utilise CASE WHEN pour identifier l'interlocuteur dans chaque relation :
   * - Si userId est le requester → l'ami est le receiver (u2)
   * - Si userId est le receiver → l'ami est le requester (u1)
   *
   * @returns Tableau des amis avec leurs informations de profil
   */
  static async getFriends(userId: number): Promise<FriendshipWithUser[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
        f.id, f.requester_id, f.receiver_id, f.status, f.created_at, f.updated_at,
        -- Détermine l'ID de l'ami (l'autre utilisateur dans la relation)
        CASE
          WHEN f.requester_id = ? THEN f.receiver_id
          ELSE f.requester_id
        END as user_id,
        -- Détermine le username de l'ami
        CASE
          WHEN f.requester_id = ? THEN u2.username
          ELSE u1.username
        END as username,
        -- Détermine l'email de l'ami
        CASE
          WHEN f.requester_id = ? THEN u2.email
          ELSE u1.email
        END as email,
        -- Détermine l'avatar de l'ami
        CASE
          WHEN f.requester_id = ? THEN u2.avatar
          ELSE u1.avatar
        END as avatar
      FROM friendships f
      JOIN users u1 ON f.requester_id = u1.id
      JOIN users u2 ON f.receiver_id = u2.id
      -- Filtre : l'utilisateur est impliqué dans la relation ET le statut est 'accepted'
      WHERE (f.requester_id = ? OR f.receiver_id = ?) AND f.status = ?
      ORDER BY f.updated_at DESC`,
      [userId, userId, userId, userId, userId, userId, 'accepted']
    );
    return rows as FriendshipWithUser[];
  }

  /**
   * Récupère les demandes d'ami reçues et en attente de réponse
   * Ce sont les demandes où userId est le receiver et le statut est 'pending'
   */
  static async getPendingRequests(userId: number): Promise<FriendshipWithUser[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
        f.id, f.requester_id, f.receiver_id, f.status, f.created_at, f.updated_at,
        f.requester_id as user_id,  -- L'interlocuteur est toujours le demandeur ici
        u.username, u.email, u.avatar
      FROM friendships f
      JOIN users u ON f.requester_id = u.id  -- On joint avec le demandeur pour avoir ses infos
      WHERE f.receiver_id = ? AND f.status = ?  -- userId est le destinataire de la demande
      ORDER BY f.created_at DESC`,
      [userId, 'pending']
    );
    return rows as FriendshipWithUser[];
  }

  /**
   * Récupère les demandes d'ami envoyées et en attente de réponse
   * Ce sont les demandes où userId est le requester et le statut est 'pending'
   */
  static async getSentRequests(userId: number): Promise<FriendshipWithUser[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
        f.id, f.requester_id, f.receiver_id, f.status, f.created_at, f.updated_at,
        f.receiver_id as user_id,  -- L'interlocuteur est le destinataire de la demande
        u.username, u.email, u.avatar
      FROM friendships f
      JOIN users u ON f.receiver_id = u.id  -- On joint avec le destinataire pour avoir ses infos
      WHERE f.requester_id = ? AND f.status = ?  -- userId est l'expéditeur de la demande
      ORDER BY f.created_at DESC`,
      [userId, 'pending']
    );
    return rows as FriendshipWithUser[];
  }

  /**
   * Vérifie si deux utilisateurs sont amis (relation acceptée)
   * Fonctionne dans les deux sens (userId1→userId2 ou userId2→userId1)
   * @returns true si les deux utilisateurs sont amis
   */
  static async areFriends(userId1: number, userId2: number): Promise<boolean> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id FROM friendships
       WHERE ((requester_id = ? AND receiver_id = ?) OR (requester_id = ? AND receiver_id = ?))
       AND status = ?`,
      [userId1, userId2, userId2, userId1, 'accepted']
    );
    return rows.length > 0;
  }

  /**
   * Récupère le statut actuel de la relation entre deux utilisateurs
   * Vérifie dans les deux directions (qui a envoyé la demande en premier)
   * @returns Le statut ('pending', 'accepted', 'rejected') ou null si aucune relation
   */
  static async getRequestStatus(userId1: number, userId2: number): Promise<string | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT status FROM friendships
       WHERE (requester_id = ? AND receiver_id = ?) OR (requester_id = ? AND receiver_id = ?)`,
      [userId1, userId2, userId2, userId1]
    );
    return rows.length > 0 ? rows[0].status : null;
  }
}
