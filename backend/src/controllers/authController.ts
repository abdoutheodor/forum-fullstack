// Contrôleur d'authentification
// Gère l'inscription, la connexion et la gestion du profil utilisateur

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { AuthRequest } from '../middleware/auth';

/**
 * Inscription d'un nouvel utilisateur
 * Route: POST /api/auth/register
 *
 * Vérifie l'unicité de l'email et du username, crée l'utilisateur,
 * puis génère un token JWT pour une connexion immédiate après inscription
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // Vérification que l'email n'est pas déjà utilisé
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      res.status(400).json({ success: false, message: 'Email déjà utilisé' });
      return;
    }

    // Vérification que le nom d'utilisateur n'est pas déjà pris
    const existingUsername = await UserModel.findByUsername(username);
    if (existingUsername) {
      res.status(400).json({ success: false, message: 'Nom d\'utilisateur déjà utilisé' });
      return;
    }

    // Création de l'utilisateur (le mot de passe sera hashé dans UserModel.create)
    const userId = await UserModel.create(username, email, password);

    // Génération du token JWT permettant à l'utilisateur de se connecter immédiatement
    // Le token contient l'ID et l'email (payload) et est signé avec JWT_SECRET
    const token = jwt.sign(
      { id: userId, email },
      process.env.JWT_SECRET as string
    );

    // Réponse 201 Created avec le token et l'ID du nouvel utilisateur
    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      data: { userId, token }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Connexion d'un utilisateur existant
 * Route: POST /api/auth/login
 *
 * Vérifie les identifiants, contrôle le statut du compte (banni ?),
 * puis retourne un token JWT et les infos du profil
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Recherche de l'utilisateur par email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      // Message volontairement vague pour ne pas révéler si l'email existe ou non
      res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
      return;
    }

    // Vérification si le compte est banni avant de continuer
    if (user.is_banned) {
      res.status(403).json({ success: false, message: 'Votre compte a été banni' });
      return;
    }

    // Comparaison du mot de passe en clair avec le hash stocké en base (via bcrypt)
    const isPasswordValid = await UserModel.comparePassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
      return;
    }

    // Génération du token JWT de session
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET as string
    );

    // Réponse avec le token et les données publiques du profil (sans le mot de passe)
    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          is_admin: user.is_admin  // Le frontend utilisera ce flag pour afficher les options admin
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Récupération du profil de l'utilisateur connecté
 * Route: GET /api/auth/profile
 * Nécessite authentification (middleware authenticate)
 *
 * Retourne les données publiques du profil sans le mot de passe
 */
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // req.user.id est injecté par le middleware authenticate après vérification du JWT
    const user = await UserModel.findById(req.user!.id);

    if (!user) {
      res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
      return;
    }

    // On exclut le mot de passe de la réponse (bonne pratique de sécurité)
    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        is_admin: user.is_admin,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Mise à jour du profil de l'utilisateur connecté
 * Route: PUT /api/auth/profile
 * Nécessite authentification (middleware authenticate)
 *
 * Permet de modifier l'avatar et/ou la bio
 * Seuls les champs fournis dans le body sont mis à jour
 */
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { avatar, bio } = req.body;

    // UserModel.updateProfile construit dynamiquement la requête SQL
    // pour ne mettre à jour que les champs fournis
    const updated = await UserModel.updateProfile(req.user!.id, avatar, bio);

    if (!updated) {
      // Aucune ligne affectée : aucun champ valide n'a été fourni
      res.status(400).json({ success: false, message: 'Aucune modification effectuée' });
      return;
    }

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
