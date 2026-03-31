// Modèle Report : gère les signalements d'utilisateurs
// Les signalements sont examinés et traités par les administrateurs via le panel admin

import pool from '../config/database';
import { Report } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class ReportModel {
  /**
   * Crée un nouveau signalement
   * @param reporterId     - ID de l'utilisateur qui signale
   * @param reportedUserId - ID de l'utilisateur signalé
   * @param reason         - Motif du signalement
   * @returns L'ID du signalement créé
   */
  static async create(reporterId: number, reportedUserId: number, reason: string): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO reports (reporter_id, reported_user_id, reason) VALUES (?, ?, ?)',
      [reporterId, reportedUserId, reason]
    );
    return result.insertId;
  }

  /**
   * Récupère un signalement par son ID avec les noms des utilisateurs impliqués
   * Le double JOIN permet d'avoir à la fois le nom du signaleur et du signalé
   * @returns Le signalement avec les usernames, ou null si non trouvé
   */
  static async findById(id: number): Promise<any | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT r.*,
              u1.username as reporter_username,    -- Nom de l'utilisateur qui a signalé
              u2.username as reported_username     -- Nom de l'utilisateur signalé
       FROM reports r
       JOIN users u1 ON r.reporter_id = u1.id
       JOIN users u2 ON r.reported_user_id = u2.id
       WHERE r.id = ?`,
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Récupère tous les signalements avec pagination et filtre optionnel par statut
   * @param status - Filtre optionnel : 'pending' | 'reviewed' | 'resolved'
   * @param limit  - Nombre de résultats par page (défaut: 50)
   * @param offset - Décalage pour la pagination
   */
  static async getAll(status?: string, limit: number = 50, offset: number = 0): Promise<any[]> {
    // Construction dynamique de la requête selon si un filtre de statut est appliqué ou non
    let query = `SELECT r.*,
                        u1.username as reporter_username,
                        u2.username as reported_username
                 FROM reports r
                 JOIN users u1 ON r.reporter_id = u1.id
                 JOIN users u2 ON r.reported_user_id = u2.id`;
    const params: any[] = [];

    // Ajout de la clause WHERE uniquement si un statut est demandé
    if (status) {
      query += ' WHERE r.status = ?';
      params.push(status);
    }

    // Ajout du tri et de la pagination à la fin de la requête
    query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.execute<RowDataPacket[]>(query, params);
    return rows;
  }

  /**
   * Met à jour le statut d'un signalement (workflow de modération)
   * Transitions possibles : pending → reviewed → resolved
   * @param status - Nouveau statut : 'pending' | 'reviewed' | 'resolved'
   * @returns true si la mise à jour a réussi
   */
  static async updateStatus(id: number, status: 'pending' | 'reviewed' | 'resolved'): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE reports SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Supprime définitivement un signalement de la base de données
   * @returns true si la suppression a réussi
   */
  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM reports WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Compte le nombre de signalements pour un statut donné
   * Utile pour afficher des statistiques dans le dashboard admin
   * (ex: "5 signalements en attente")
   */
  static async countByStatus(status: string): Promise<number> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM reports WHERE status = ?',
      [status]
    );
    return rows[0].count;
  }
}
