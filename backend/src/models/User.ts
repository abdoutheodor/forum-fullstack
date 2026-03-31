// Modèle User : encapsule toutes les opérations de base de données liées aux utilisateurs
// Utilise des méthodes statiques pour éviter l'instanciation inutile

import pool from '../config/database';
import bcrypt from 'bcrypt';
import { User } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class UserModel {
  /**
   * Crée un nouvel utilisateur en base de données
   * Le mot de passe est hashé avec bcrypt avant stockage (facteur de coût = 10)
   * @returns L'ID du nouvel utilisateur inséré
   */
  static async create(username: string, email: string, password: string): Promise<number> {
    // Hash du mot de passe : on ne stocke JAMAIS les mots de passe en clair
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]  // Les ? sont des placeholders préparés (protection contre l'injection SQL)
    );
    return result.insertId; // Retourne l'ID auto-incrémenté du nouvel utilisateur
  }

  /**
   * Recherche un utilisateur par son adresse email
   * Utilisé principalement lors de la connexion
   * @returns L'utilisateur trouvé ou null si inexistant
   */
  static async findByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    // Retourne le premier résultat ou null si aucun résultat
    return rows.length > 0 ? (rows[0] as User) : null;
  }

  /**
   * Recherche un utilisateur par son ID
   * Utilisé principalement par le middleware d'authentification
   * @returns L'utilisateur trouvé ou null si inexistant
   */
  static async findById(id: number): Promise<User | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? (rows[0] as User) : null;
  }

  /**
   * Recherche un utilisateur par son nom d'utilisateur
   * Utilisé pour vérifier l'unicité lors de l'inscription
   * @returns L'utilisateur trouvé ou null si inexistant
   */
  static async findByUsername(username: string): Promise<User | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    return rows.length > 0 ? (rows[0] as User) : null;
  }

  /**
   * Met à jour le profil d'un utilisateur (avatar et/ou bio)
   * Construit dynamiquement la requête SQL pour ne mettre à jour que les champs fournis
   * @returns true si la mise à jour a affecté au moins une ligne, false sinon
   */
  static async updateProfile(id: number, avatar?: string, bio?: string): Promise<boolean> {
    const updates: string[] = []; // Liste des colonnes à mettre à jour
    const values: any[] = [];     // Valeurs correspondantes (dans le même ordre)

    // Ajout conditionnel des champs à mettre à jour
    if (avatar !== undefined) {
      updates.push('avatar = ?');
      values.push(avatar);
    }
    if (bio !== undefined) {
      updates.push('bio = ?');
      values.push(bio);
    }

    // Si aucun champ n'est à mettre à jour, on retourne false immédiatement
    if (updates.length === 0) return false;

    // L'ID est ajouté en dernier car il correspond au WHERE id = ?
    values.push(id);
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  /**
   * Compare un mot de passe en clair avec son hash stocké en base
   * Utilise bcrypt.compare qui est sécurisé contre les timing attacks
   * @returns true si les mots de passe correspondent
   */
  static async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Banne ou débanne un utilisateur
   * Un utilisateur banni ne peut plus se connecter ni accéder aux routes protégées
   * @param isBanned - true pour bannir, false pour débannir
   * @returns true si la mise à jour a réussi
   */
  static async banUser(userId: number, isBanned: boolean): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE users SET is_banned = ? WHERE id = ?',
      [isBanned, userId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Récupère la liste paginée de tous les utilisateurs (sans le mot de passe)
   * Utilisé exclusivement par les administrateurs
   * @param limit  - Nombre maximum d'utilisateurs à retourner (défaut: 50)
   * @param offset - Décalage pour la pagination (défaut: 0)
   */
  static async getAllUsers(limit: number = 50, offset: number = 0): Promise<User[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      // Le champ 'password' est volontairement exclu de la sélection pour ne pas l'exposer
      'SELECT id, username, email, avatar, bio, is_admin, is_banned, created_at FROM users LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return rows as User[];
  }
}
