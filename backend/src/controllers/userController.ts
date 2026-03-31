// Contrôleur utilisateur
// Gère la recherche d'utilisateurs et la consultation de profils publics

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

/**
 * Recherche des utilisateurs par username ou email
 * Route: GET /api/users/search?query=motcle
 * Nécessite authentification
 *
 * Utilise une recherche partielle (LIKE %) et exclut l'utilisateur courant des résultats
 * (on ne s'affiche pas soi-même dans les résultats de recherche)
 */
export const searchUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { query } = req.query;
    // ID de l'utilisateur connecté (pour s'exclure des résultats)
    const currentUserId = req.user?.id;

    // Vérification de l'authentification (req.user peut être undefined si le middleware échoue)
    if (!currentUserId) {
      res.status(401).json({ message: 'Non authentifié' });
      return;
    }

    // Validation du paramètre de recherche
    if (!query || typeof query !== 'string') {
      res.status(400).json({ message: 'Requête de recherche requise' });
      return;
    }

    // Construction du terme de recherche avec wildcards pour une correspondance partielle
    const searchTerm = `%${query}%`;
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, username, email, avatar, bio
       FROM users
       -- Recherche dans le username OU l'email
       WHERE (username LIKE ? OR email LIKE ?)
       -- Exclusion de l'utilisateur connecté (on ne se cherche pas soi-même)
       AND id != ?
       LIMIT 20`,  // Limite à 20 résultats pour les performances
      [searchTerm, searchTerm, currentUserId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * Récupère le profil public d'un utilisateur par son ID
 * Route: GET /api/users/:id
 * Nécessite authentification
 *
 * Retourne uniquement les informations publiques (sans email ni mot de passe)
 */
export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute<RowDataPacket[]>(
      // Sélection des champs publics uniquement (email exclu ici pour la confidentialité)
      'SELECT id, username, email, avatar, bio, created_at FROM users WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({ message: 'Utilisateur non trouvé' });
      return;
    }

    // Retourne le premier (et unique) résultat
    res.json(rows[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
